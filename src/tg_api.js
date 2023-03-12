export async function sendMessage(token, chat_id, text, reply_to) {
    let url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&text=${encodeURIComponent(text)}`;
    if(reply_to !== undefined) {
        url += `&reply_to_message_id=${reply_to}&allow_sending_without_reply=true`
    }
    return await fetch(url);
}

export async function sendVideo(token, chat_id, video, caption) {
    let url = `https://api.telegram.org/bot${token}/sendVideo?chat_id=${chat_id}&video=${encodeURIComponent(video)}`+
        `&caption=${encodeURIComponent(caption)}&parse_mode=MarkdownV2`;
    return await fetch(url);
}

export async function sendImages(token, chat_id, images, caption) {
    let imageList = [];
    for (let image of images) {
        imageList.push({"type": "photo", "media": image});
    }
    imageList[0]["caption"] = caption;
    imageList[0]["parse_mode"] = "MarkdownV2";
    imageList = JSON.stringify(imageList);

    let url = `https://api.telegram.org/bot${token}/sendMediaGroup?chat_id=${chat_id}&media=${encodeURIComponent(imageList)}`;
    return await fetch(url);
}

export async function deleteMessage(token, chat_id, message_id) {
    return await fetch(`https://api.telegram.org/bot${token}/deleteMessage?chat_id=${chat_id}&message_id=${message_id}`);
}