import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import "reflect-metadata"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;
app.use(bodyParser.json());

app.post('/api/v0/session/open', (req: Request, res: Response) => {
  
});

app.post(['/api', '/api/*'], (req: Request, res: Response) => {
  res.json({ ok: false, status: 0 });
});
app.get(['/api', '/api/*'], (req: Request, res: Response) => {
  res.json({ ok: false, status: 0 });
});

app.get('/', (req: Request, res: Response) => {
  res.send("АаААааАААаАаАаааАаАаАааАа чооооо");
})

app.listen(port, () => {
  console.log(`[server]: Server is running!`);
});