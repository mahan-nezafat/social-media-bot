import express, { Express, Request, Response, NextFunction } from "express";
import fetch from "node-fetch";
import axios from "axios";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import { AppDataSource } from "./data-source";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { handleBotCommands, setListOfCommands } from "./bot/commands";
import { handleBotErrors } from "./bot/errors/errors.handle";
import { setupYoutubeCommands } from "./bot/youtubeDownloader";

import ytdl from "@distube/ytdl-core";
import createLogger from 'progress-estimator'
import { handleYoutube } from "./bot/socialhandlers/youtube.handler";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Bot initialization
const token = process.env.BOT_TOKEN;
if (!token) {
    console.log("BOT_TOKEN must be provided!");
}

const bot = new TelegramBot(token, { polling: true });
// const logger = createLogger()


// // Database Connection
// AppDataSource.initialize()
//     .then(() => {
//         console.log("Database connection established");
//     })
//     .catch((error) => {
//         console.error("Error connecting to database:", error);
//     });


// After bot initialization
setListOfCommands(bot);
handleBotCommands(bot);
handleBotErrors(bot);
handleYoutube(bot)

console.log("bot started ")

export default app;

