import React from "react";
import ReactDOM from "react-dom";
import { TimeSeriesGraph } from "./graphs";

console.clear();
function App() {
  return (
    <div className="App">
      <TimeSeriesGraph duration={7} />
      <TimeSeriesGraph duration={14} />
      <TimeSeriesGraph duration={21} />
      <TimeSeriesGraph duration={31} />
      <TimeSeriesGraph duration={63} />
      <TimeSeriesGraph duration={100} />
      <TimeSeriesGraph duration={281} />
      <TimeSeriesGraph duration={365} />
      <TimeSeriesGraph duration={400} />
      <TimeSeriesGraph duration={750} />
      <TimeSeriesGraph duration={1100} />
    </div>
  );
}
const app = <App />;
const rootElement = document.getElementById("root");
ReactDOM.render(app, rootElement);
