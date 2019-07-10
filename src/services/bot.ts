import * as TelegramBot from 'node-telegram-bot-api';
import * as rp from 'request-promise';
import { askOlami } from './olami';
import { searchVideo } from './youtube';

const TOKEN = process.env.TELEGRAM_TOKEN;
const API_PREFIX = `https://api.telegram.org/bot${TOKEN}`;

const bot = new TelegramBot(TOKEN);

bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, 'Welcome', {
    "reply_markup": {
      "keyboard": [["ping!"],  ["youtube 大笨鐘"], ["chat 台北天氣"]]
    }
  });
});

bot.onText(/ping!/, (msg) => {
  bot.sendMessage(msg.chat.id, 'pong!');
});

bot.onText(/^youtube (.*)+/, async msg => {
  const key = msg.text.substring(8);

  let video = await searchVideo(key);
  console.log(video.id);
  console.log(video.snippet);

  bot.sendMessage(
    msg.chat.id,
    `<a href="http://www.youtube.com/watch?v=${video.id.videoId}">${video.snippet.title}</a>`,
    { parse_mode: "HTML" });
});

bot.onText(/^chat (.*)+/, async msg => {
  const text = msg.text.substring(5);

  let res = await askOlami(text);

  if (res.status === 'ok') {
    const type1 = res.data.nli[0];
    console.log(type1);
    bot.sendMessage(msg.chat.id, type1.desc_obj.result);

    if (type1.data_obj) {
      if (type1.type === "joke") {
        bot.sendMessage(msg.chat.id, type1.data_obj[0].content);
      }
      if (type1.type === "kkbox") {
        bot.sendMessage(msg.chat.id, type1.data_obj[0].url);
      }
    }
  }
});

bot.on('sticker', async msg => {
  console.log(msg);
});

bot.on('message', async msg => {
  let chatId = msg.chat.id;

  if (msg.animation) {
    rp({
      method: 'POST',
      uri: `${API_PREFIX}/sendAnimation`,
      formData: {
        chat_id: chatId,
        animation: msg.animation.file_id
      }
    }).then(res => {
      console.log(res);
    }).catch(e => {
      console.error(e);
    });
    return;
  }
});

export default bot;
