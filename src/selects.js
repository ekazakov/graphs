import React from "react";

const options = [
  {
    value: 1,
    label: "Daily"
  },
  {
    label: "Weekly",
    value: 7
  },
  {
    label: "Monthly",
    value: 30
  },
  {
    label: "Quarterly",
    value: 90
  },
  {
    label: "Yearly",
    value: 365
  }
];

export function Select(props) {
  const { days, value, onChange } = props;
  const filteredOptions = options.filter(item => days / item.value >= 3);

  return (
    <select onChange={ev => onChange(ev.target.value)} value={value}>
      {filteredOptions.map(item => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

export function SelectInterval(props) {
  const { value, onChange } = props;
  const options = ["preserveStart", "preserveEnd", "preserveStartEnd"];
  return (
    <select onChange={ev => onChange(ev.target.value)} value={value}>
      {options.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}
