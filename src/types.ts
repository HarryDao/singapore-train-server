export interface TrainData {
  firstTrain: number;
  lastTrain: number;
  timeBtw2Stations: number;
  timeBtw2Lines: number;
  isPeak: boolean;
  frequencies:
    | false
    | {
        [line: string]: number;
      };
}
