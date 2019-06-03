import React from "react";
import { split, get } from "lodash";

const splitDate = (value, granularity) => {
  if (granularity === "7") {
    const [week, number, year] = split(value, " ");
    return {
      head: `${week} ${number}`,
      tail: year
    };
  }

  const [day, ...monthYear] = split(value, " ");
  return {
    head: day,
    tail: monthYear.join(" ")
  };
};

export const CustomizedTick = props => {
  const { x, y, payload, formattedTicks, granularity } = props;
  // console.log("payload:", props);

  const { head, tail } = splitDate(get(formattedTicks, payload.value), granularity);

  return (
    <g transform={`translate(${x},${y})`} fontSize="12px">
      <text x={0} y={0} dy={16} textAnchor="start" fill="#666">
        {head}
      </text>
      <text x={0} y={13} dy={16} textAnchor="start" fill="#666">
        {tail}
      </text>
    </g>
  );
};
