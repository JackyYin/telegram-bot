import * as rp from 'request-promise';
import * as md5 from 'md5';
import * as urlencode from 'urlencode';

function askOlami(text): Promise<any> {
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

  return rp({
    uri: url,
    json: true
  });
}

export { askOlami };
