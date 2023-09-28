import { Server, Socket } from 'socket.io';
import { TIME_ZONE_OFFSET, TRAIN_CONFIGS, MRT_LINES } from '../configs';
import { TrainData } from '../types';

const SOCKET_EVENTS = {
  connection: 'connection',
  trainInformation: 'train-information',
};

const {
  BROADCAST_INTERVALS_IN_MINUTES,
  FIRST_TRAIN,
  LAST_TRAIN,
  PEAK_HOURS,
  FREQUENCY,
  TIME_BTW_2_STATIONS,
  TIME_BTW_2_LINES,
} = TRAIN_CONFIGS;
const INTERVALS_IN_MILISECONDS = BROADCAST_INTERVALS_IN_MINUTES * 60 * 1000;

const getTrainInformation = () => {
  const now = new Date();
  const hours = (now.getUTCHours() + TIME_ZONE_OFFSET) % 24;
  const minutes = now.getUTCMinutes();
  const time = hours + minutes / 60;

  const result: TrainData = {
    firstTrain: FIRST_TRAIN,
    lastTrain: LAST_TRAIN,
    timeBtw2Stations: TIME_BTW_2_STATIONS,
    timeBtw2Lines: TIME_BTW_2_LINES,
    isPeak: false,
    frequencies: false,
  };

  if (time < FIRST_TRAIN || time > LAST_TRAIN) {
    return result;
  }

  const isPeak = PEAK_HOURS.some(({ from, to }) => from <= time && time <= to);
  const FREQUENCIES = isPeak ? FREQUENCY.peak : FREQUENCY.off_peak;
  const frequencies = MRT_LINES.reduce((f: { [line: string]: number }, line) => {
    f[line] = FREQUENCIES[0] + Math.floor(Math.random() * (FREQUENCIES[1] - FREQUENCIES[0] + 1));
    return f;
  }, {});

  result.frequencies = frequencies;
  result.isPeak = isPeak;

  return result;
};

const findNextBroadcastTimeout = () => {
  const now = new Date();
  const miliseconds =
    now.getMinutes() * 60 * 1000 + now.getSeconds() * 1000 + now.getMilliseconds();
  let next = INTERVALS_IN_MILISECONDS;

  while (next < miliseconds) {
    next += INTERVALS_IN_MILISECONDS;
  }

  return next - miliseconds;
};

export const broadcastTrainInformation = (() => {
  let data: TrainData, io: Server;

  function broadcast(socket?: Socket) {
    if (!socket || !data) {
      data = getTrainInformation();
    }

    const target = socket || io.sockets;

    if (target) {
      target.emit(SOCKET_EVENTS.trainInformation, data);
    }
  }

  function init() {
    broadcast();
    setTimeout(() => {
      broadcast();
      setInterval(broadcast, INTERVALS_IN_MILISECONDS);
    }, findNextBroadcastTimeout());

    io.on(SOCKET_EVENTS.connection, broadcast);
  }

  return function (socketIO: Server) {
    io = socketIO;
    init();
  };
})();
