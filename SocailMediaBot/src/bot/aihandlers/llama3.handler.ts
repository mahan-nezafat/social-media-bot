import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import { commandsMap } from "../commands";

export const handleLlama3 = async (bot: TelegramBot) => {
    bot.on("message", async (msg) => {
        const userCommand = commandsMap.get(msg.chat.id);
        if (userCommand === "llama3") {
            if (msg.text === "/llama3" || msg.text === "/playlist" || msg.text === "/youtube") return;
            // console.log(msg)
            const data = {
                messages: [
                    {
                        role: "system",
                        content: "You are a friendly and helpful chat bot ",
                    },
                    {
                        role: "user",
                        content: msg.text,
                    },
                ],
                max_tokens: 1000,
            };

            console.log(data);
            const res = await axios({
                method: "post",
                url: `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUD_FLARE_ID}/ai/run/@cf/meta/llama-3.3-70b-instruct-fp8-fast`,
                data: JSON.stringify(data),

                headers: {
                    // Content-Type: "application/json",
                    Authorization: `Bearer ${process.env.CLOUD_FLARE_API_KEY}`,
                },
            });
            // console.log(res.data.result.response);
            bot.sendMessage(msg.chat.id, res.data.result.response);
        }
    });
};
