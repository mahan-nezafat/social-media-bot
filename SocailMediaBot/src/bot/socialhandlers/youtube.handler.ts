import TelegramBot from "node-telegram-bot-api";
import ytdl from "@distube/ytdl-core";
import fs from "node:fs";
import path from "node:path";
import ytpl from "@distube/ytpl";
export const handleYoutube = async (bot: TelegramBot) => {
    let url: string;
    let message;
    let contentTitle: string;
    const downloadPath = path.join(__dirname, "../../downloads");
   
    const fileName =  path.join(downloadPath, 'text')
    fs.writeFile(fileName, "", () => {
        
        console.log('start');
    })
    console.log(downloadPath);
    if (!fs.existsSync(downloadPath)) {
        fs.mkdirSync(downloadPath);
    }
    bot.onText(
        /\/(https:\/\/|www.|)(youtube.com|youtu.be)\/.+/,
        async (msg) => {
            try {
                message = msg;
                url = msg.text;

                // validate url
                if (!ytdl.validateURL(url)) return;
                const { formats, videoDetails } = await ytdl.getInfo(url);
                contentTitle = videoDetails.title;
                
                if (url) {
                    
                    const playlistData = await ytpl(url, {limit: 10});
                    // for (const item of playlistData.items) {
                        const fileName =  path.join(downloadPath, playlistData.items[0].title)
                        fs.writeFile(fileName, "", () => {
                            
                            console.log('start');
                        })
                        ytdl(playlistData.items[0].shortUrl, { quality: "highestaudio" })
                            .pipe(fs.createWriteStream(fileName))
                            .on("finish", () => {
                                console.log(`downloaded ${playlistData.items[0].title}`);
                                // bot.sendAudio(message.chat.id, fileName);
                            });
                        
                    // }
                    // console.log(playlistData);
                    //validate url -> get playlist data -> select url of items -> pass the urls to ytdl -> save downloads while sending to user
                } else {
                    // filter formats available
                    // const filteredFormats = formats.filter((format, index) => {
                    //     return typeof format.qualityLabel === "string" && format.mimeType.split(";")[0] === "video/mp4" ;
                    // });

                    // map formats to readable input for user
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
                    // const mappedFilters = filteredFormats.map((format, index) => {

                    //     return [
                    //         {
                    //             text: `${format.mimeType.split(";")[0]} ${format.qualityLabel}`,
                    //             callback_data: `format_${format.qualityLabel}`,
                    //         },

                    //     ];
                    // });

                    // bot.editMessageReplyMarkup
                    bot.sendMessage(
                        msg.chat.id,
                        `
                        name: ${videoDetails.title}
                        video-duration: ${Math.floor(
                            Number(formats[0].approxDurationMs) / 1000 / 60
                        )} minutes
                        `
                    );
                    // send formats for user to choose
                    bot.sendMessage(msg.chat.id, "choose your quality", {
                        parse_mode: "Markdown",
                        reply_markup: {
                            inline_keyboard: formatArray,
                        },
                    });
                }
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
            if (quality === "highestaudio") {
                const fileName = path.join(downloadPath, `${contentTitle}.mp3`);
                ytdl(url, { quality: quality })
                    .pipe(fs.createWriteStream(fileName))
                    .on("finish", () => {
                        console.log("uploading the audio file...");
                        bot.sendAudio(message.chat.id, fileName);
                    });
            }
            const fileName = path.join(downloadPath, `${contentTitle}.mp4`);
            ytdl(url, { quality: quality })
                .pipe(fs.createWriteStream(fileName))
                .on("finish", () => {
                    console.log("uploading the video file...");
                    bot.sendVideo(message.chat.id, fileName);
                });
        } catch (error) {
            console.log(error);
        }
    });
};
