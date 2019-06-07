import { random, times, reduce, head, size, round } from "lodash";
import { addDays, startOfDay } from "date-fns";

// aggregate: {
//     qualityIndex: 87,
//         advanced: 85,
//         basic: 87
// },
export function generateTimeseries(total, granularity) {
  const now = startOfDay(new Date(2017, 10, 1));
  const items = times(total, n => ({
    date: addDays(now, n).getTime(),
    value: random(20, 90)
  }));

  if (granularity === 1) {
    return items;
  }

  if (granularity == 30) {
    granularity = 31;
  }

  const results = [];
  while (size(items) > 0) {
    const chunk = items.splice(0, granularity);
    const agg = round(reduce(chunk, (agg, item) => agg + item.value, 0) / size(chunk));
    results.push({
      value: agg,
      date: head(chunk).date
    });
  }

  return results;
}
