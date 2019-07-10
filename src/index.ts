import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as ngrok from 'ngrok';
import bot from './services/bot';

const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = new Koa();

declare module 'koa' {
  interface Request {
    body?: any;
    rawBody: string;
  }
}

app.use(bodyParser());

const router = new Router();

router.post('/hook', async (ctx: Router.RouterContext, next: Function) => {
  bot.processUpdate(ctx.request.body);
  ctx.status = 200;
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, async () => {
  console.log(`Koa server is listening on ${port}`);
});

ngrok.connect(port).then(url => {
  console.log(url);
  bot.setWebHook(`${url}/hook`);
}).catch(e => {
  console.error(e);
});

