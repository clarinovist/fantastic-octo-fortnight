import React from "react";
import ReactDOM from "react-dom/client";
import { HomepageScreen } from "./screens/HomepageScreen";
import "./index.css";

console.log("Starting app...");

const root = document.getElementById("app");
console.log("App element:", root);

if (root) {
  console.log("Rendering HomepageScreen...");
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HomepageScreen />
    </React.StrictMode>
  );
  console.log("Render complete");
} else {
  console.error("Could not find app element");
}
