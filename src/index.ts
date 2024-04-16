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
  const IP = req.socket.remoteAddress;
  if (!IP) return res.send();
  res.send((await SessionManager.OpenNewSession(IP)).Hash);
});
app.get('/api/v0/session/pulse', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress;
  const Hash = req.headers['session']?.toString() || "";
  if (!IP || !Hash) return res.send();
  res.send((await SessionManager.RenewSession(Hash, IP)).Hash);
});

app.post('/api/v0/user/auth', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (Session.IsDecayed()) return res.json();


  // AUTH
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
  console.log(`[SERVER]: Server is running!`);
});