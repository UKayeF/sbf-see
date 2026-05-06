import { render } from "preact";
import { App } from "./App";
import "./styles.css";

const app = document.getElementById("app");

if (app) {
  render(<App />, app);
}
