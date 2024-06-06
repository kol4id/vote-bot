import dotenv from 'dotenv'
dotenv.config();

import { bot, token} from "./bot";
import * as fs from 'fs';
import TelegramBot from 'node-telegram-bot-api';
import { connectDB } from './db';
import Vote from './models/vote';
import { checkIsAdmin, checkSubscription } from './checkSubs';

const userBeginInteraction = new Map<number, boolean>();
const userLoading = new Map<number, boolean>();
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const artists: {users: IArtist[]} = JSON.parse(fs.readFileSync('users.json', 'utf-8'))!;
const secretKey = process.env.KEY!;

// console.log(artists)

interface IArtist{
    name: string,
    media: string[]
}

async function canVote(chatId: number): Promise<boolean>{
    if (userBeginInteraction.has(chatId)) return userBeginInteraction.get(chatId)!;

    const canVote = await Vote.findOne({chatId: chatId});
    userBeginInteraction.set(chatId, canVote?.canVote!);
    return canVote?.canVote!
}

async function setCanVote(chatId: number, value: boolean): Promise<void>{
    userBeginInteraction.set(chatId, value)!;
    await Vote.updateOne({chatId: chatId}, {canVote: value});
}

const sendGroupPhoto = async(chatId: number) =>{
    let groupNum = 1;
    for (const artist of artists.users) {
        const media = artist.media.map(photo => {
            return {
                type: 'photo',
                media: `src/assets/${photo}`
            } as TelegramBot.InputMediaPhoto;
        });
        if (media.length > 0) {
            media[0].caption = `${groupNum++}\n\nartist: ${artist.name}`;
        }
        await bot.sendMediaGroup(chatId, media);
        await delay(2500);
    }
    await bot.sendMessage(chatId, `Введите номер работы которая вам понравилась\n\nEnter the number of the job you liked`)

    await setCanVote(chatId, true);
    userLoading.set(chatId, false);
    
    userBeginInteraction.set(chatId, true);
}
const main = async() =>{
    await connectDB();
    bot.onText(/\/start/, async msg=> {
        const chatId = msg.chat.id;
        if (!isPrivateChat(msg)) return;
        if (!await checkSubscription(chatId)){
            notSubbed(chatId);
            return;
        } 
    
        const vote = await Vote.findOne({chatId: chatId});
    
        if (userLoading.get(chatId)) {
            await bot.sendMessage(chatId, "Я уже отправляю тебе рисунки\n\nI'm already sending you the drawings.")
            return;
        }
        if (!vote){
            await Vote.create({chatId: chatId})
        }
    
        await setCanVote(chatId, false);
        userLoading.set(chatId, true);
    
        await bot.sendMessage(chatId, "Привет, сейчас тебе будут представлены работы участников, проголосуй за лучшую из них. Для голоса дождись пока все картинки загрузятся и напиши мне число от 1 до 22 обозначающее номер группы. Всего 22 работы\n\nHi, now you will be presented with the works of the participants, vote for the best of them. For the voice, wait until all the pictures are loaded and write me a number from 1 to 22 indicating the group number. There are 22 works in total\n")
    
        await delay(10000);
        await sendGroupPhoto(chatId);
    })
    
    bot.onText(/\/votes/, async msg=> {
        const chatId = msg.chat.id;
        if (!isPrivateChat(msg)) return;
        if (!await checkIsAdmin(chatId)) return;
    
        passFunc(chatId);
    })
    
    bot.on('message', async msg => {
        const chatId = msg.chat.id;
        if (!isPrivateChat(msg)) return;
        const input = msg.text!;
    
        if (input === '/start' || input === '/votes') return;
    
        if (!await checkSubscription(chatId)){
            notSubbed(chatId);
            return;
        } 
    
        if(input == secretKey){ 
            passFunc(chatId);
            return  
        }
    
        const isCanVote = await canVote(chatId);
        if (!isCanVote){
            bot.sendMessage(chatId, `Вы еще не посмотрели все картины, отправьте /start\n\nYou haven't seen all the pictures yet, send /start`)
            return
        };
        
        if (isNaN(Number(input)) || parseInt(input) < 1 || parseInt(input) > 22) {
            await bot.sendMessage(chatId, `Введите число от 1 до 22.\nEnter a number from 1 to 22.`);
            return; 
        }
    
        let isVoteCreated = await Vote.updateOne({chatId: chatId}, {vote: input});
       
        if (isVoteCreated){
            await bot.sendMessage(chatId, `Вы проголосовали за группу №${input}, ваш голос успешно засчитан\n\nYou voted for group №${input}, your vote has been successfully counted`)
        } else {
            await bot.sendMessage(chatId, `Что-то пошло не так, уведомите админа и попробуйте позже\n\nSomething went wrong, notify the admin and try again later`)
        }
    })
}

main();

const passFunc = async(chatId: number) =>{
    const voteCount = await Vote.aggregate([
        {$match: {vote: {$gte: 1, $lte:22}}},
        {$group: {_id: '$vote', count: {$sum: 1}}},
        {$sort: {count: -1}}
    ])

    // console.log(voteCount)

    let index = 1;
    let message: string ='';
    for (const vote of voteCount){
        // console.log(vote)
        message += `${index++}е место - ${artists.users[vote._id - 1].name}, голосов: ${vote.count}\n`;
    }

    bot.sendMessage(chatId, message)
}

const notSubbed = (chatId: number) => {
    bot.sendMessage(chatId, 'Для участия в голосовании нужно быть подписаным\nна канал - https://t.me/JohnDickTon\nна чат - https://t.me/JohnDickTonChat\n\nTo participate in the voting, you need to be subscribed\nto channel - https://t.me/JohnDickTon\nto chat - https://t.me/JohnDickTonChat\n\nпосле подписки отправьте /start\n\nafter subscribing, send /start')
}

const isPrivateChat = (msg: TelegramBot.Message) => {
    return msg.chat.type === 'private';
};