import {escapeStr, getVideoUrl} from './utils';
import {deleteMessage, sendChatAction, sendImages, sendMessage, sendVideo} from './tg_api'

export default {
    async fetch(request, env, context) {
        return await handleRequest(request, env, context)
    }
}

const DELETE_ORIGINAL_MESSAGE = true; // Delete message with tiktok link(s) after successful uploading or not

async function ttHandler(token, message) {
    const chatId = message.chat.id;
    const fromId = message.from.id;
    const messageId = message.message_id;
    if (!message.text) return;

    const tiktok_links = message.text.match(/https?:\/\/(?:(?:vt|vm|www).)?tiktok\.com\/(?:@[a-zA-Z0-9-_.]+\/video\/\d{17,}|[a-zA-Z0-9-_]{8,10})/g);
    if (!tiktok_links) return;

    console.log(`Got ${tiktok_links.length} tt links.`);
    let action_resp = await (await sendChatAction({
        token: token,
        chat_id: chatId,
        action: "upload_video",
        message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
    })).json(); // Send "uploading video" action
    if(!action_resp.ok && action_resp.error_code === 401) return; // Invalid token provided
    for (let link of tiktok_links) {
        console.log(`Downloading ${link}...`);
        if (!link) continue;

        let tikwm_req = await fetch("https://tikwm.com/api/", {
            body: `url=${encodeURIComponent(link)}&web=1&hd=1&count=0`,
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'}
        });
        let tikwm_resp;
        try {
            tikwm_resp = await tikwm_req.json();
            if (!tikwm_resp || !tikwm_resp.data || !tikwm_resp.data.hdplay) continue;
        } catch (e) {
            console.error(e);
            console.log(await tikwm_req.text());
            continue;
        }

        const videoUrl = await getVideoUrl(tikwm_resp);
        if (!videoUrl) {
            await sendMessage({
                token: token,
                chat_id: chatId,
                text: "Video is over 20 MB and cannot be uploaded.",
                reply_to: messageId,
                message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
            });
            continue;
        }

        let caption = "";
        if(fromId !== chatId)
            caption += `Sent by: [${escapeStr(message.from.first_name)}](tg://user?id=${fromId})\n`;

        caption += `[Link](${escapeStr(link)})`;
        if (tikwm_resp.data.title)
            caption += `\n\n||${escapeStr(tikwm_resp.data.title)}||`;

        console.log(`Sending video/audio to telegram...`);
        await sendChatAction({
            token: token,
            chat_id: chatId,
            action: "upload_video",
            message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
        });
        let tg_req = await sendVideo({
            token: token,
            chat_id: chatId,
            video: videoUrl,
            caption: caption,
            message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
        });
        let tg_resp = await tg_req.json();
        if (!tg_resp.ok) {
            console.error(`Error: ${tg_resp.description} (${JSON.stringify(tg_resp)})`);
            if (tg_resp.error_code !== 401)
                await sendMessage({
                    token: token,
                    chat_id: chatId,
                    text: `Error: ${tg_resp.description}`,
                    reply_to: messageId,
                    message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
                });
            else
                return; // Invalid token provided
        }

        if (tikwm_resp.data.images) {
            await sendChatAction({
                token: token,
                chat_id: chatId,
                action: "upload_photo",
                message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
            });
            console.log(`Sending images to telegram...`);
            let images = tikwm_resp.data.images;
            for (let i = 0; i < images.length; i += 10) {
                await sendImages({
                    token: token,
                    chat_id: chatId,
                    images: images.slice(i, i + 10),
                    caption: caption,
                    message_thread_id: message.is_topic_message ? message.message_thread_id : undefined
                });
            }
        }

        if (DELETE_ORIGINAL_MESSAGE && tg_resp.ok && fromId !== chatId)
            await deleteMessage({
                token: token,
                chat_id: chatId,
                message_id: messageId
            });
    }
}

async function handleRequest(request, env, ctx) {
    if (request.method !== "POST") {
        return new Response("", {status: 405});
    }
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return new Response("", {status: 400});
    }
    const secret = request.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
    if (secret !== env.SECRET_KEY) {
        return new Response("", {status: 401});
    }
    let json = await request.json();
    if (!json.message)
        return new Response("");

    if (!json.message.text && json.message.caption) json.message.text = json.message.caption;

    const pattern = new URLPattern({ pathname: '/:bot_token/tt_bot' });
    const req = pattern.exec(request.url).pathname.groups;

    ctx.waitUntil(ttHandler(req.bot_token, json.message));
    return new Response("");
}