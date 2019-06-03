import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { size, groupBy, mapValues, values, reduce, keys, map, flatMapDeep, zipObject } from "lodash";
import formatDateFns from "date-fns/format";
import { getWeek, getYear, getMonth, getQuarter } from "date-fns";
import styled from "styled-components";
import { generateTimeseries } from "./data";
import { Select, SelectInterval } from "./selects";
import { CustomizedTick } from "./tick";

const chartMargin = {
  top: 0,
  bottom: 0,
  right: 70,
  left: 0
};

const Wrapper = styled.div`
  padding: 30px;

  & .recharts-text.recharts-cartesian-axis-tick-value {
    font-size: 12px;
  }
`;
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
`;

const formatDate = (duration, granularity) => date => {
  const showDayInTick = Math.ceil(duration / 10) <= 21;
  if (granularity === "7") {
    return `KW ${getWeek(date)} ${getYear(date)}`;
  }
  if (showDayInTick) {
    return formatDateFns(date, "dd MMM yyyy");
  }
  return formatDateFns(date, "MMM yyyy");
};

const formatDay = options => date => {
  const { isFirstDay, isFirstMonth, isSingleYear } = options;
  const fmtOptions = ["dd"];
  if (isFirstDay) {
    fmtOptions.push("MMM");
  }

  if (isFirstDay && isFirstMonth && !isSingleYear) {
    fmtOptions.push("yy");
  }

  return formatDateFns(date, fmtOptions.join(" "));
};

const formatWeek = options => date => {
  const { isFirstWeek, isSingleYear } = options;

  const week = `KW ${getWeek(date)}`;
  if (isFirstWeek && !isSingleYear) {
    return `${week} ${getYear(date)}`;
  }
  return week;
};

const formatMonth = options => date => {
  const { isFirstMonth, isSingleYear } = options;
  const fmtOptions = ["MMM"];

  if (isFirstMonth && !isSingleYear) {
    fmtOptions.push("yy");
  }

  return formatDateFns(date, fmtOptions.join(" "));
};

const formatters = {
  1: formatDay,
  7: formatWeek,
  30: formatMonth
};

const formatDate2 = granularity => options => date => {
  const { isFirstDay, isFirstWeek, isFirstMonth, isSingleYear } = options;
  if (granularity == "7") {
    const week = `KW ${getWeek(date)}`;
    if (isFirstWeek && !isSingleYear) {
      return `${week} ${getYear(date)}`;
    }
    return week;
  }

  const fmtOptions = ["dd"];
  if (isFirstDay) {
    fmtOptions.push("MMM");
  }

  // console.log("options.isFirstItem", options.isFirstItem);
  if (isFirstDay && isFirstMonth && !isSingleYear) {
    fmtOptions.push("yy");
  }

  return formatDateFns(date, fmtOptions.join(" "));
};

const formatGroup = (year, options, format) => {
  const monthes = keys(year);

  return reduce(
    monthes,
    (result, month, monthIndex) => {
      const days = year[month];
      options.isFirstMonth = monthIndex === 0;

      result[month] = map(days, (date, index) => {
        const opts = { ...options, isFirstDay: index === 0 };
        return format(opts)(date);
      });
      return result;
    },
    {}
  );
};

const groupByMonth = items => groupBy(items, tick => getMonth(tick));

const formatTicks = (ticks, granularity) => {
  const byYear = groupBy(ticks, tick => getYear(tick));
  const isSingleYear = size(byYear) === 1;
  const formatter = formatters[granularity];
  if (granularity == 7) {
    const g3 = reduce(
      byYear,
      (result, dates, year) => {
        const options = { isSingleYear };
        result[year] = map(dates, (date, index) => {
          const opts = { ...options, isFirstWeek: index === 0 };
          return formatter(opts)(date);
        });
        return result;
      },
      {}
    );

    return zipObject(ticks, flatMapDeep(g3, values));
  }

  const g3 = reduce(
    byYear,
    (result, dates, year) => {
      const options = { isSingleYear };
      const byMonth = groupByMonth(dates);
      result[year] = formatGroup(byMonth, options, formatter);
      return result;
    },
    {}
  );

  return zipObject(ticks, flatMapDeep(g3, values));
};

export function TimeSeriesGraph(props) {
  const { duration } = props;
  const [granularity, updateGranularity] = useState(1);
  const [interval, updateInterval] = useState("preserveStart");

  const data = generateTimeseries(duration, granularity);
  const divider = 10;
  const stepSize = Math.ceil(size(data) / divider);

  const ticks = data.filter((_, index) => index % stepSize === 0).map(item => item.date);
  const title = `${duration} days graph, ticks: ${size(ticks)} , stepSize: ${stepSize}`;
  const formattedTicks = formatTicks(ticks, granularity);
  console.log("tiks", formattedTicks);

  return (
    <Wrapper>
      <Header>
        {title}
        <div>
          <Select value={granularity} onChange={updateGranularity} days={duration} />
          <SelectInterval value={interval} onChange={updateInterval} />
        </div>
      </Header>
      <LineChart margin={chartMargin} width={552} height={240} data={data}>
        <XAxis
          dataKey="date"
          type="number"
          scale="time"
          ticks={ticks}
          domain={["dataMin", "dataMax"]}
          interval={interval}
          // tick={<CustomizedTick granularity={granularity} tickFormatter={formatDate(duration, granularity)} />}
          tick={<CustomizedTick granularity={granularity} formattedTicks={formattedTicks} />}
          height={70}
          minTickGap={2}
          tickFormatter={() => "-"}
        />
        <YAxis type="number" domain={[0, 100]} tickFormatter={value => `${value}%`} />
        <Tooltip labelFormatter={unixTime => formatDateFns(unixTime, "dd MMM yyyy")} />

        <Line name="Value" dot={false} isAnimationActive={false} type="monotone" dataKey="value" stroke="#7D84EE" />
        <Legend iconType="circle" align="left" />
      </LineChart>
      <div>
        {ticks.map((tick, index) => (
          <span style={{ marginRight: 8, fontSize: 10 }} key={`${tick}-${index}`}>
            {/* {formatDateFns(tick, "dd MMM yyyy")} */}
            {formatDate(duration, granularity)(tick)}
          </span>
        ))}
      </div>
    </Wrapper>
  );
}
