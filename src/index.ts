const TelegramBot = require('node-telegram-bot-api');;
const express = require('express');
const bodyParser = require('body-parser');
const rp = require('request-promise');
const md5 = require('md5');
const urlencode = require('urlencode');
const ytdl = require('ytdl-core');
const fs = require('fs');
const ngrok = require('ngrok');

 // public URL
const port = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_TOKEN;
const API_PREFIX = `https://api.telegram.org/bot${TOKEN}`;
const bot = new TelegramBot(TOKEN);

const app = express();

app.use(bodyParser.json());

app.post('/hook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Express server is listening on ${port}`);
});

ngrok.connect(port).then(url => {
  console.log(url);
  bot.setWebHook(`${url}/hook`);
}).catch(e => {
  console.error(e);
});

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
  console.log(msg);
  
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

async function askOlami(text) {
  const secret = process.env.OLAMI_SECRET;
  const key = process.env.OLAMI_KEY;
  const now = Date.now();
  const apiName = 'nli';

  const genSign = () => {
    let data = `${secret}api=${apiName}appkey=${key}timestamp=${now}${secret}`;
    return md5(data);
  };

  let url = 'https://tw.olami.ai/cloudservice/api?_from=nodejs';
  url += '&appkey='+ process.env.OLAMI_KEY;
  url += '&api='+ apiName;
  url += '&timestamp='+ now;
  url += '&sign='+ genSign();
  url += '&rq={"data":{"input_type":1,"text":"'+ urlencode(text)  +'"},"data_type":"stt"}';

  console.log(url);

  return await rp({
    uri: url,
    json: true
  });
}

async function searchVideo(keyword) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&type=video&key=${process.env.YOUTUBE_API_KEY}&q=${urlencode(keyword)}`;

  let col = await rp({
    uri: url,
    json: true
  });

  console.log(col);

  let length = col.items.length;
  let index = Math.floor(Math.random() * length);
  return col.items[index];
}
