import TelegramBot from "node-telegram-bot-api";
import ytdl from "@distube/ytdl-core";
import fs from "node:fs";
import path from "node:path";
import ytpl from "@distube/ytpl";
import { commandsMap } from "../commands";
import progress from "progress-stream";
export const handleYoutube = async (bot: TelegramBot) => {
    let url: string;
    let messageId;
    let contentTitle;
    let audioSize;
    let videoSize;
    let editMsgId;
    let markupMsgId
    const downloadPath = path.join(__dirname, "../../downloads");
    console.log(downloadPath);
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }

    bot.on(
        "message",
        // /\/(https:\/\/|www.|)(youtube.com|youtu.be)\/.+/,
        async (msg) => {
            try {
                const userCommand = commandsMap.get(msg.chat.id);

                if (userCommand !== "youtube") return;

                messageId = msg.chat.id;
                url = msg.text;
                const { formats, videoDetails } = await ytdl
                    .getInfo(url)
                    .then((info) => info);
                audioSize = parseInt(
                    formats.filter((format) =>
                        format.mimeType.includes("audio/mp4")
                    )[0].contentLength
                );
                videoSize = parseInt(
                    formats.filter((format) =>
                        format.mimeType.includes("video/mp4")
                    )[0].contentLength
                );

                contentTitle = videoDetails.title;
                // validate url
                // if (!ytdl.validateURL(url)) return;
                // const { formats, videoDetails } = await ytdl.getInfo(url);

                // map formats to readable input for user
                // console.log(formats.filter((format) =>
                //     format.mimeType.includes("video/mp4")
                // ))
                const formatArray = [
                    [
                        {
                            text: "video/mp4 144p",
                            callback_data: "format_144p",
                        },
                        {
                            text: "video/mp4 240p",
                            callback_data: "format_240p",
                        },
                    ],
                    [
                        {
                            text: "video/mp4 360p",
                            callback_data: "format_360p",
                        },
                        {
                            text: "video/mp4 480p",
                            callback_data: "format_480p",
                        },
                    ],
                    [
                        {
                            text: "video/mp4 720p",
                            callback_data: "format_720p",
                        },
                        {
                            text: "video/mp4 1080p",
                            callback_data: "format_1080p",
                        },
                    ],
                    [
                        {
                            text: "audio/mp3 best quality",
                            callback_data: "format_highestaudio",
                        },
                    ],
                ];

                const sentMsg = await bot.sendMessage(
                    msg.chat.id,
                    `
                        name: ${videoDetails.title}
                        video-duration: ${Math.floor(
                            Number(formats[0].approxDurationMs) / 1000 / 60
                        )} minutes
                        `
                );
                // send formats for user to choose
                const markup = await bot.sendMessage(msg.chat.id, "choose your quality", {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: formatArray,
                    },
                });
                editMsgId = sentMsg.message_id;
                markupMsgId = markup.message_id
                // }
            } catch (error) {
                console.log(error);
            }
        }
    );
    bot.on("callback_query", async (query) => {
        try {
            // check if download folder exist if not create it

            // TODO update the progress for transfer with details filesize speed time to end every second by editing bot message
            const data = query.data;
            const quality = data.split("_")[1];
            let updateInterval = 3000;
            let lastUpdateTime = Date.now();
            bot.deleteMessage(messageId, markupMsgId);
            const progressStream = progress({
                length: quality === "highestaudio" ? audioSize : videoSize,
                speed: 3000,
            });
            progressStream.on("progress", async (progress) => {
                const percent = progress.percentage <= 100 ? progress.percentage : 100
                const currentTime = Date.now();
                if (currentTime - lastUpdateTime >= updateInterval) {
                    const percentage = percent / 10;
                    const filled = Math.floor(percentage);
                    const empty = 10 - filled;
                    const progressBar = `█`.repeat(filled) + `░`.repeat(empty);

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
                            chat_id: messageId,
                            message_id: editMsgId,
                            parse_mode: "Markdown",
                        }
                    );
                    lastUpdateTime = currentTime;
                }
            });
            progressStream.on("end", () => {
                bot.deleteMessage(messageId, editMsgId);
            });
            if (quality === "highestaudio") {
                const fileName = path.join(downloadPath, `${contentTitle}.mp3`);
                ytdl(url, { quality: quality })
                    .pipe(progressStream)
                    .pipe(fs.createWriteStream(fileName))
                    .on("finish", () => {
                        console.log("uploading the audio file...");
                        bot.sendAudio(messageId, fileName);
                    });
            } else {
                const fileName = path.join(downloadPath, `${contentTitle}.mp4`);
                ytdl(url, { quality: quality })
                    .pipe(progressStream)
                    .pipe(fs.createWriteStream(fileName))
                    .on("finish", () => {
                        console.log("uploading the video file...");
                        bot.sendVideo(messageId, fileName);
                    });
            }
        } catch (error) {
            console.log(error);
        }
    });
};
