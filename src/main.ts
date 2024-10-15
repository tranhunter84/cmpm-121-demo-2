import "./style.css";

const APP_NAME = "HUNTER'S DEMO #2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

const appCanvas = document.createElement("canvas");
appCanvas.width = 256;
appCanvas.height = 256;
app.appendChild(appCanvas);
