import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import "reflect-metadata"
import './services/db-service'
import { SessionManager } from "./services/session-manager";
import { AuthCredentials, AuthService } from "./services/auth-service";
import { MessagingService } from "./services/messaging-service";
import formData from "express-form-data";
import os from "os";
import { Chat } from "./entities/chat";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

const formDataOptions = {
  uploadDir: os.tmpdir(),
  autoClean: true
};

app.use(formData.parse(formDataOptions));
app.use(formData.stream());
app.use(formData.union());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/v0/session/open', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress;
  console.log(`SESSION ${IP}`);
  if (!IP) return res.send();
  res.send((await SessionManager.OpenNewSession(IP)).Hash);
});
app.get('/api/v0/session/pulse', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress;
  const Hash = req.headers['session']?.toString() || "";
  console.log(`PULSE ${IP}:${Hash}`);
  if (!IP || !Hash) return res.send("0");
  var s = await SessionManager.RenewSession(Hash, IP);
  res.send(s.IsDecayed() ? "0" : "1");
});

app.post('/api/v0/user/auth', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  console.log(`AUTH: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  console.log(req.headers["content-type"]);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const username = req.body["username"] as string | undefined;
  const password = req.body["password"] as string | undefined;

  const apires = await AuthService.AuthUser(new AuthCredentials(username, password));
  console.log(apires);
  res.json(apires);
});
app.post('/api/v0/user/register', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  console.log(`REGISTER: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const username = req.body["username"] as string | undefined;
  const password = req.body["password"] as string | undefined;

  const apires = await AuthService.RegisterUser(new AuthCredentials(username, password), IP);
  console.log(apires);
  res.json(apires);
});

app.post('/api/v0/client/messages/pull', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString() || "";
  const offset = req.body["options"]["username"] as number | undefined;
  const count = req.body["options"]["password"] as number | undefined;
  const chatid = req.body["password"] as number | undefined;

  const apires = await MessagingService.PullMessage(token, chatid, offset, count);
  res.json(apires);
});
app.post('/api/v0/client/messages/push', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const text = req.body["text"] as string | undefined;
  const chatid = req.body["password"] as number | undefined;

  const apires = await MessagingService.PushMessage(token || "", text || "", chatid || -1);
  res.json(apires);
});

app.post('/api/v0/client/chat/create', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString() || "";
  const userIDs = req.body["userid"] as number[];
  const title = req.body["title"] as string;

  const apires = await MessagingService.CreateChat(token, userIDs, title);
  res.json({ ok: apires.code == 220, code: apires.code, chat: apires.chat});
});

app.post(['/api', '/api/*'], async (req: Request, res: Response) => {
  res.json({ ok: false, status: 0 });
});
app.get(['/api', '/api/*'], async (req: Request, res: Response) => {
  res.json({ ok: false, status: 0 });
});

app.get('/', (req: Request, res: Response) => {
  res.send(`Server running.\n${new Date().toString()}`);
})

app.listen(port, () => {
  console.log(`[SERVER]: Server is running!`);
});