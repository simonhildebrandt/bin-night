import * as luxon from 'luxon';

const { DateTime, Interval } = luxon;

export { DateTime, Interval };

import { Rule } from './rschedule';

import TimeAgo from 'javascript-time-ago';
// Load locale-specific relative date/time formatting rules.
import en from 'javascript-time-ago/locale/en'
TimeAgo.addLocale(en)
// Create relative date/time formatter.
export const timeAgo = new TimeAgo('en-AU')


export function nextDate({startDate, day, startTime, direction='before', offset=0, zone='Australia/Melbourne'}) {
  const rule = new Rule({
    frequency: 'WEEKLY',
    byDayOfWeek: [day],
    start: DateTime.fromSeconds(startDate.seconds).setZone(zone),
  })


  const occurrences = rule.occurrences();
  const now = DateTime.local();

  let next;
  do {
    next = occurrences.next().value.date
      .startOf('day')
      .plus({minutes: startTime})
      .plus({seconds: (direction === 'before' ? -1 : 1) * offset});

  } while (next < now);

  return next;
}
