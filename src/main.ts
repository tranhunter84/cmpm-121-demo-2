import "./style.css";

const APP_NAME = "HUNTER'S DEMO #2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// ===================================
// INITIALIZATION OF CORE VARIABLES
const appCanvas = document.createElement("canvas");
const drawingContext = appCanvas.getContext("2d");
const clearButton = document.createElement("button");
let drawingActive = false;
clearButton.textContent = "Clears the drawing canvas";
appCanvas.width = 256;
appCanvas.height = 256;
if (!drawingContext) {
    throw new Error("Drawing context creation returned NULL object!");
}

// ===================================
// ADD EVENT LISTENERS TO PAGE ELEMENTS
appCanvas.addEventListener("mousedown", (event) => {
    drawingActive = true;
    drawingContext.beginPath(); 
    drawingContext.moveTo(event.offsetX, event.offsetY); 
});
appCanvas.addEventListener("mousemove", (event) => {
    if (drawingActive) {
        drawingContext.lineTo(event.offsetX, event.offsetY); 
        drawingContext.stroke(); 
    }
});
appCanvas.addEventListener("mouseup", () => {
    drawingActive = false;
    drawingContext.closePath(); 
});
clearButton.addEventListener("click", () => {
    drawingContext.clearRect(0, 0, appCanvas.width, appCanvas.height); 
});

// ===================================
// MAIN PROGRAM
app.appendChild(appCanvas);
app.appendChild(clearButton);