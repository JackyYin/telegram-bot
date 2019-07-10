import * as rp from 'request-promise';
import * as urlencode from 'urlencode';

async function searchVideo(keyword): Promise<any> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&order=viewCount&type=video&key=${process.env.YOUTUBE_API_KEY}&q=${urlencode(keyword)}`;

  let col = await rp({
    uri: url,
    json: true
  });

  console.log(col);

  let index = Math.floor(Math.random() * col.items.length);
  return col.items[index];
}

export { searchVideo };
