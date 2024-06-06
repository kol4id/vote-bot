import axios from "axios";

export class ChatMessagesService{
    constructor(private readonly botToken: string){}

    async getMessages(chatId: number, messageId: number) {
        try{
            const responce = await axios.get(`https://api.telegram.org/${this.botToken}/getChatHistory`, {
                params: {
                    chat_id: chatId,
                    message_id: messageId,
                }
            });
            if (responce.data.ok) {
                console.log(responce.data)
            }
        } catch (error) {
            console.log(error)
        }
    }
}