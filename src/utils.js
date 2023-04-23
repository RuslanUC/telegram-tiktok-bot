export function escapeStr(str) {
    for (let ch of ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!']) {
        str = str.replaceAll(ch, "\\" + ch)
    }
    return str;
}

async function checkSize(url, maxSize=20*1e6) {
    let resp = await fetch(url);
    let size = parseInt(resp.headers.get('content-length'));
    console.log(`Video size in bytes: ${size};`);
    return size < maxSize;
}

export async function getVideoUrl(tikwm_resp) {
    for(let form of ["hdplay", "play"]) {
        console.log(`Trying ${form}...`);
        const url = `https://tikwm.com${tikwm_resp.data[form]}`
        if(await checkSize(url))
            return (await fetch(url)).url;
        console.log(`[${form}] Content-Length > 20mb.`);
    }
}

export async function checkSecretKey(key, env, token) {
    if(key.startsWith("ttbot_")) {
        let hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.SECRET_KEY+token))
        let hashArray = Array.from(new Uint8Array(hashBuffer))
        let hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex === key.substring(6);
    } else {
        return key === env.SECRET_KEY;
    }
}