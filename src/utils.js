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