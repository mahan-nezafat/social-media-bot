import TelegramBot from "node-telegram-bot-api";

export const handleBotErrors = async (bot: TelegramBot) => {
    bot.on("polling_error", (err) => {
        console.log(`got an error from polling connection ${err}`)
    })
    bot.on("webhook_error", (err) => {
        console.log(`got an error from webhook connection ${err}`)

    })
}