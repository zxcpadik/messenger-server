import dotenv from "dotenv";
import "reflect-metadata"
import './services/db-service'
import express, { Express, Request, Response } from "express";
import formData from "express-form-data";
import os from "os";
import { SessionManager } from "./services/session-manager";
import { AuthCredentials, AuthService } from "./services/auth-service";
import { MessagingService } from "./services/messaging-service";

dotenv.config();

const app: Express = express();

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
  if (process.env.DEBUG_MODE == "true") console.log(`SESSION ${IP}`);
  if (!IP) return res.send();
  res.send((await SessionManager.OpenNewSession(IP)).Hash);
});
app.get('/api/v0/session/pulse', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress;
  const Hash = req.headers['session']?.toString() || "";
  if (process.env.DEBUG_MODE == "true") console.log(`PULSE ${IP}:${Hash}`); // DEBUG
  if (!IP || !Hash) return res.send("0");
  var s = await SessionManager.RenewSession(Hash, IP);
  res.send(s.IsDecayed() ? "0" : "1");
});

app.post('/api/v0/user/auth', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`AUTH: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const username = (req.body["username"] as string | undefined)?.trim();
  const password = (req.body["password"] as string | undefined)?.trim();

  const apires = await AuthService.AuthUser(new AuthCredentials(username, password));
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/user/register', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`REGISTER: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const username = (req.body["username"] as string | undefined)?.trim();
  const password = (req.body["password"] as string | undefined)?.trim();

  const apires = await AuthService.RegisterUser(new AuthCredentials(username, password), IP);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});

app.post('/api/v0/client/messages/pull', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`MSG-PULL: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const offset = req.body["options"]?.["offset"] as number | undefined;
  const count = req.body["options"]?.["count"] as number | undefined;
  const chatid = req.body["chatid"] as number | undefined;

  const apires = await MessagingService.PullMessage(token, chatid, offset, count);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/messages/push', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`MSG-PUSH: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const text = (req.body["text"] as string | undefined)?.trim();
  const chatid = req.body["chatid"] as number | undefined;

  const apires = await MessagingService.PushMessage(token, text, chatid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/messages/remove', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`MSG-REMOVE: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;
  const messageid = req.body["messageid"] as number | undefined;

  const apires = await MessagingService.RemoveMesasge(token, chatid, messageid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});

app.post('/api/v0/client/chat/create', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-CREATE: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const userIDs = req.body["userid"] as number[] | undefined;
  const title = (req.body["title"] as string | undefined)?.trim();
  const description = (req.body["description"] as string | undefined)?.trim();

  const apires = await MessagingService.CreateChat(token, userIDs, title, description);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/get', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-GET: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();

  const apires = await MessagingService.GetUserChats(token);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/clear', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-CLEAR: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;

  const apires = await MessagingService.ClearChat(token, chatid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/remove', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-REMOVE: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;

  const apires = await MessagingService.RemoveChat(token, chatid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/info', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-REMOVE: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;

  const apires = await MessagingService.ChatInfo(token, chatid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/setinfo', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-SETINFO: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;
  const title = (req.body["title"] as string | undefined)?.trim();
  const description = (req.body["description"] as string | undefined)?.trim();

  const apires = await MessagingService.SetChatInfo(token, chatid, title, description);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/adduser', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-ADDUSER: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;
  const userid = req.body["userid"] as number | undefined;

  const apires = await MessagingService.AddUser(token, chatid, userid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});
app.post('/api/v0/client/chat/removeuser', async (req: Request, res: Response) => {
  const IP = req.socket.remoteAddress || "";
  const Hash = req.headers['session']?.toString() || "";
  const Session = await SessionManager.GetSession(Hash, IP);

  if (process.env.DEBUG_MODE == "true") console.log(`CHAT-REMOVEUSER: ${IP}:${Hash}:${Session.IsDecayed() ? "BAD" : "OK"}`);
  if (process.env.DEBUG_MODE == "true") console.log(req.body);

  if (Session.IsDecayed()) return res.send("SESSION EXPIRED");

  const token = req.headers['token']?.toString();
  const chatid = req.body["chatid"] as number | undefined;
  const userid = req.body["userid"] as number | undefined;

  const apires = await MessagingService.RemoveUser(token, chatid, userid);
  if (process.env.DEBUG_MODE == "true") console.log(apires);
  res.json(apires);
});

app.post(['/api', '/api/*'], async (req: Request, res: Response) => {
  console.log(`NOAPI: ${req.url}`);
  res.json({ ok: false, status: 0 });
});
app.get(['/api', '/api/*'], async (req: Request, res: Response) => {
  console.log(`NOAPI: ${req.url}`);
  res.json({ ok: false, status: 0 });
});

app.get('/', (req: Request, res: Response) => {
  res.send(`Server running.\n${new Date().toString()}`);
})

app.listen({ port: 8080, host: "0.0.0.0"}, () => {
  console.log(`[SERVER]: Server is running!`);
});