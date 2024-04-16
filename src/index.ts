import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import "reflect-metadata"
import { SessionManager } from "./services/session-manager";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());

app.get('/api/v0/session/open', async (req: Request, res: Response) => {
  var IP = req.socket.remoteAddress;
  if (!IP) return res.send();
  res.send((await SessionManager.OpenNewSession(IP)).Hash);
});

app.get('/api/v0/session/ping', async (req: Request, res: Response) => {
  var IP = req.socket.remoteAddress;
  var Hash = req.headers['session']?.toString() || "";
  if (!IP) return res.send();
  res.send((await SessionManager.RenewSession(Hash, IP)).Hash);
});

app.post(['/api', '/api/*'], async (req: Request, res: Response) => {
  res.json({ ok: false, status: 0 });
});
app.get(['/api', '/api/*'], async (req: Request, res: Response) => {
  res.json({ ok: false, status: 0 });
});

app.get('/', (req: Request, res: Response) => {
  res.send("АаААааАААаАаАаааАаАаАааАа чооооо");
})

app.listen(port, () => {
  console.log(`[server]: Server is running!`);
});