import { DateTime } from 'luxon';
import arrayToSentence from 'array-to-sentence';

export const  DATE_FORMAT_OPTIONS = {
  ...DateTime.DATETIME_MED,
  weekday: 'long',
  month: 'long',
  hour: 'numeric',
  hourCycle: 'h12',
};

export const TIME_FORMAT = {...DateTime.TIME_SIMPLE, hourCycle: 'h12'};

const minutes = [];
const date = DateTime.local().startOf('day');
for (let i = 0; i < 1440; i+=15) {
  minutes.push({i, string: date.plus({minutes: i}).toLocaleString(TIME_FORMAT)})
}
export const TIMES_15_MINUTE_INCREMENTS = minutes;

export function timeLabelByIncrement(minutes) {
  return TIMES_15_MINUTE_INCREMENTS.find(inc => inc.i === minutes)
}

export const CADENCE_DAYS = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday',
}

export const COLLECTION_TYPES = {
  rubbish: 'rubbish',
  recycling: 'recycling',
  green: 'green waste'
}

export function humaniseCollectionTypes(types) {
  return arrayToSentence(types.map(type => COLLECTION_TYPES[type]))
}
