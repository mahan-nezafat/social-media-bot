import TelegramBot from "node-telegram-bot-api";

export const setListOfCommands = (bot: TelegramBot) => {
    try {
        bot.setMyCommands([
            { command: "start", description: "start the bot" },
            { command: "about", description: "about the bot" },
            { command: "help", description: "how to use the bot" },
            { command: "youtube", description: "access youtube single downloader" },
            { command: "playlist", description: "access youtube playlist downloader" },
        ]);
    } catch (error) {
        console.log(error);
    }
};

// bot -> botontext check command -> get chatid -> send message to with chatid

export const handleBotCommands = async (bot: TelegramBot) => {
    //TODO change the language of the bot based on user when they start it for the first time.
    // starting the bot and greeting user
    bot.onText(/\/start/, async (msg) => {
        try {
            console.log(msg);
            console.log(msg.chat);
            const chatId = msg.chat.id;
            const respose =
                msg.from.language_code === "en"
                    ? `hello ${msg.chat.first_name} the bot has started.`
                    : `سلام ${msg.chat.first_name} ربات استارت شد.`;
            await bot.sendMessage(chatId, respose);
        } catch (error) {
            console.log(error);
        }
    });
    bot.onText(/\/about/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            const respose =
                msg.from.language_code === "en"
                    ? `welcome to social media bot here you can download your favorite content`
                    : ` سلام به ربات سوشیال مدیا خوش آمدید.
    اینجا محتوای مورد نظر خودتون رو میتونید دانلود کنید.`;
            await bot.sendMessage(chatId, respose);
        } catch (error) {
            console.log(error);
        }
    });
    bot.onText(/\/help/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            const respose =
                msg.from.language_code === "en"
                    ? `choose your social media from the commands and send the link url of the content`
                    : `سوشیال مدیا مورد نظر خودتون رو انتخاب و لینک محتوا را ارسال کنید`;
            await bot.sendMessage(chatId, respose);
        } catch (error) {
            console.log(error);
        }
    });
    bot.onText(/\/youtube/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            const respose =
                msg.from.language_code === "en"
                    ? `send a valid url link`
                    : `لینک صحیح را ارسال کنید`;
            await bot.sendMessage(chatId, respose);
        } catch (error) {
            console.log(error);
        }
    });
    bot.onText(/\/playlist/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            const respose =
                msg.from.language_code === "en"
                    ? `send a valid url link`
                    : `لینک صحیح را ارسال کنید`;
            await bot.sendMessage(chatId, respose);
        } catch (error) {
            console.log(error);
        }
    });
};


export const selectFormat = async (bot: TelegramBot) => {
    
}