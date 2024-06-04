import TelegramBot from "node-telegram-bot-api";
import * as process from 'process';

// const token = process.env.BOT_TOKEN;
const token = '7459382432:AAFano_cqp7hqwxA2KahKWS-96ihhAgHMpA';
console.log(token)
export const bot = new TelegramBot(token!, {polling: true});