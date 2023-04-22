export async function sendMessage({token, chat_id, text, reply_to, message_thread_id}) {
    let url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${encodeURIComponent(text)}`;
    if(reply_to !== undefined) {
        url += `&reply_to_message_id=${reply_to}&allow_sending_without_reply=true`
    }
    if(message_thread_id)
        url += `&message_thread_id=${message_thread_id}`;
    return await fetch(url);
}

export async function sendVideo({token, chat_id, video, caption, message_thread_id}) {
    let url = `https://api.telegram.org/bot${token}/sendVideo?chat_id=${chat_id}&video=${encodeURIComponent(video)}`+
        `&caption=${encodeURIComponent(caption)}&parse_mode=MarkdownV2`;
    if(message_thread_id)
        url += `&message_thread_id=${message_thread_id}`;
    return await fetch(url);
}

export async function sendImages({token, chat_id, images, caption, message_thread_id}) {
    let imageList = [];
    for (let image of images) {
        imageList.push({"type": "photo", "media": image});
    }
    imageList[0]["caption"] = caption;
    imageList[0]["parse_mode"] = "MarkdownV2";
    imageList = JSON.stringify(imageList);

    let url = `https://api.telegram.org/bot${token}/sendMediaGroup?chat_id=${chat_id}&media=${encodeURIComponent(imageList)}`;
    if(message_thread_id)
        url += `&message_thread_id=${message_thread_id}`;
    return await fetch(url);
}

export async function deleteMessage({token, chat_id, message_id}) {
    return await fetch(`https://api.telegram.org/bot${token}/deleteMessage?chat_id=${chat_id}&message_id=${message_id}`);
}

export async function sendChatAction({token, chat_id, action, message_thread_id}) {
    let url = `https://api.telegram.org/bot${token}/sendChatAction?chat_id=${chat_id}&action=${action}`;
    if(message_thread_id)
        url += `&message_thread_id=${message_thread_id}`;
    return await fetch(url);
}