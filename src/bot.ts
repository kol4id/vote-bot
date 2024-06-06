import TelegramBot from "node-telegram-bot-api";
import * as process from 'process';
import { Telegraf } from "telegraf";

export const token = process.env.BOT_TOKEN!;
export const bot = new TelegramBot(token!, {polling: true});

// export const botTelegraf = new Telegraf(token);
// botTelegraf.launch()