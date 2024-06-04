import { bot } from "./bot";

bot.onText(/\/start/, async msg => {
    const chatId = msg.chat.id;
    console.log(chatId)

    bot.sendMessage(chatId, 'hello')
})