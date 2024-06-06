import { bot } from "./bot";


const channelId = process.env.CHANNEL_ID!;
const chatGroupId = process.env.CHAT_ID!;
export const checkSubscription = async (chatId: number): Promise<boolean> => {

    const channel = await bot.getChatMember(channelId, chatId);
    const chatGroup = await bot.getChatMember(chatGroupId, chatId);

    const isChannelSub = channel.status === 'member' || channel.status === 'administrator' || channel.status === 'creator';
    const isChatSub = chatGroup.status === 'member' || chatGroup.status === 'administrator' || chatGroup.status === 'creator';
   

    return isChannelSub && isChatSub
}

export const checkIsAdmin = async (chatId: number): Promise<boolean> => {

    const channel = await bot.getChatMember(channelId, chatId);
    const chatGroup = await bot.getChatMember(chatGroupId, chatId);
   
   
    const isChannelSub =  channel.status === 'administrator' || channel.status === 'creator';
    const isChatSub =  chatGroup.status === 'administrator' || chatGroup.status === 'creator';

    return isChannelSub || isChatSub
}
