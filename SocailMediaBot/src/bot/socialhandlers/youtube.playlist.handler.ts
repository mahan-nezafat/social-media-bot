import TelegramBot from "node-telegram-bot-api";
import { commandsMap } from "../commands";
import path from "node:path";
import fs from "node:fs";
import ytpl from "@distube/ytpl";
import ytdl from "@distube/ytdl-core";
import progress from "progress-stream";
import cliProgress from "cli-progress";
export const handleYoutubePlaylist = async (bot: TelegramBot) => {
    // bot.onText(/(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.*[?&]list=.*/i, async (msg) => {

    const playlistPath = path.join(__dirname, "../../downloads/playlist");
    if (!fs.existsSync(playlistPath)) {
        fs.mkdirSync(playlistPath);
    }
    bot.on("message", async (msg) => {
        try {
            const chatId = msg.chat.id;
            const userCommand = commandsMap.get(chatId);
            if (userCommand !== "playlist") return;
            const playlistData = await ytpl(msg.text, { limit: 10 });

            for (const item of playlistData.items) {
                const info = await ytdl
                    .getInfo(item.shortUrl)
                    .then((info) => info);
                const fileSize = parseInt(
                    info.formats.filter((format) =>
                        format.mimeType.includes("audio/mp4")
                    )[0].contentLength
                );

                const progressStream = progress({
                    length: fileSize,
                    speed: 3000,
                });

                const { message_id: msgId } = await bot.sendMessage(
                    chatId,
                    `playlist download started \nDownloading ${item.title}`
                );

                let updateInterval = 3000;
                let lastUpdateTime = Date.now();

                progressStream.on("progress", async (progress) => {
                    const percent = progress.percentage <= 100 ? progress.percentage : 100

                    const currentTime = Date.now();
                    if (currentTime - lastUpdateTime >= updateInterval) {
                        const percentage = percent / 10;

                        const filled = Math.floor(percentage);
                        const empty = 10 - filled;
                        const progressBar =
                            `█`.repeat(filled) + `░`.repeat(empty);

                        bot.editMessageText(
                            `*Download Progress* 📥\n` +
                                `➡️ *Speed*: ${(
                                    progress.speed /
                                    1024 /
                                    100
                                ).toFixed(2)} MB/s\n` +
                                `⏳ *ETA*: ${progress.eta} seconds\n` +
                                `📦 *Size*: ${(
                                    progress.length /
                                    1024 /
                                    1000
                                ).toFixed(2)} MB\n` +
                                `✅ *Progress*: ${percent.toFixed(
                                    1
                                )}%  \`${progressBar}\``,
                            {
                                chat_id: chatId,
                                message_id: msgId,
                                parse_mode: "Markdown",
                            }
                        );
                        lastUpdateTime = currentTime;
                    }
                });
                progressStream.on("end", () => {
                    bot.deleteMessage(chatId, msgId)
                })

                const fileName = path.join(
                    playlistPath,
                    `${item.title.trim().replace(/[\\\/:*?"<>|]/g, "_")}.mp3`
                );
                await new Promise<void>((resolve, reject) => {
                    ytdl(item.shortUrl, {
                        quality: "highestaudio",
                    })
                        .pipe(progressStream)
                        .pipe(fs.createWriteStream(fileName))
                        .on("finish", () => {
                            bot.sendAudio(chatId, fileName);
                        
                            resolve();
                        })
                        .on("error", reject);
                });
                console.log(`downloaded ${item.title}`);
                // console.log(fileName);
            }
        } catch (error) {
            console.log(error);
        }
    });
};
