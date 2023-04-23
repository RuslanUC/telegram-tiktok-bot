# Tiktok Telegram Bot

Bot that downloads tiktok videos (via tikwm) to telegram. Working on [Cloudflare Workers](https://workers.cloudflare.com/).

#### Demo: [@tiktok_chat_yep_bot](https://t.me/tiktok_chat_yep_bot)

## Installation

<details>
  <summary>Install bot on already existing environment.</summary>
  You can install your bot to already existing environment by executing <code>/addbot</code> command with token in <a href="https://t.me/tiktok_chat_yep_bot">@tiktok_chat_yep_bot</a>.
  <br>For example: <code>/addbot 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code>.
  <br><b>Warning: you will not be able to use the bot for your own purposes until you uninstall it: <code>/delbot 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11</code></b>
</details>

1. Create cloudflare account
2. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#install-wrangler-globally)
3. Clone repository
```shell
git clone https://github.com/RuslanUC/telegram-tiktok-bot
cd telegram-tiktok-bot
```
4. (Optional) Change SECRET_KEY in wrangler.toml
5. Upload bot to CF
```shell
wrangler publish
```
6. [Create telegram bot](https://core.telegram.org/bots/features#botfather)
7. Set bot webhook. Replace <BOT_TOKEN> with your bot token, <WORKER_URL> with CF worker url, <SECRET_KEY> with secret key in this link and open it: `https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<WORKER_URL>/<BOT_TOKEN>/tt_bot&allowed_updates=[%22message%22]&secret_token=<SECRET_KEY>`
8. Done! Now you can send TikTok link to your bot, and it should respond with video