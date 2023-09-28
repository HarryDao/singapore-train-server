import { Application } from 'express';
import { Server } from 'socket.io';
import { broadcastTrainInformation } from './controllers/train';

export default (app: Application, io: Server) => {
  broadcastTrainInformation(io);
};
