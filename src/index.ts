import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { PORT } from './configs';
import routers from './routers';

const app = express();
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server for Singapore Train running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  path: '/socket.io',
});

app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));
app.use(morgan('dev'));

routers(app, io);

app.get('/', (req, res) => {
  res.send('ok');
});
