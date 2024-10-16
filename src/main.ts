import "./style.css";

// ===================================
// BASIC APP HEADERS & STYLING
const APP_NAME = "HUNTER'S DEMO #2";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// ===================================
// INITIALIZATION OF CORE VARIABLES
const appCanvas = document.createElement("canvas");
const drawingContext = appCanvas.getContext("2d")!; 
const clearButton = document.createElement("button");
let drawingActive = false;
let lines: Array<Array<{ x: number, y: number }>> = [];
let currentLine: Array<{ x: number, y: number }> = [];

clearButton.textContent = "Clears the drawing canvas";
appCanvas.width = 256;
appCanvas.height = 256;

if (!drawingContext) {
    throw new Error("Drawing context creation returned NULL object!");
}

function redrawCanvas() {
    drawingContext.clearRect(0, 0, appCanvas.width, appCanvas.height);
    lines.forEach((line) => {
        drawingContext.beginPath();
        line.forEach((point, index) => {
            if (index === 0) {
                drawingContext.moveTo(point.x, point.y);
            } else {
                drawingContext.lineTo(point.x, point.y);
            }
        });
        drawingContext.stroke();
        drawingContext.closePath();
    });
}

// ===================================
// ADD EVENT LISTENERS TO PAGE ELEMENTS
appCanvas.addEventListener("mousedown", (event) => {
    drawingActive = true;
    currentLine = [{ x: event.offsetX, y: event.offsetY }];
});

appCanvas.addEventListener("mousemove", (event) => {
    if (drawingActive) {
        const point = { x: event.offsetX, y: event.offsetY };
        currentLine.push(point);

        const customEvent = new Event("drawing-changed"); 
        appCanvas.dispatchEvent(customEvent);
    }
});

appCanvas.addEventListener("mouseup", () => {
    drawingActive = false;
    if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = [];
        
        const customEvent = new Event("drawing-changed"); 
        appCanvas.dispatchEvent(customEvent);
    }
});

// ===================================
// OBSERVER FOR "drawing-changed" EVENT
appCanvas.addEventListener("drawing-changed", () => {
    redrawCanvas();
});

// ===================================
// CLEAR BUTTON TO RESET CANVAS
clearButton.addEventListener("click", () => {
    lines = [];
    drawingContext.clearRect(0, 0, appCanvas.width, appCanvas.height);
});

// ===================================
// MAIN PROGRAM
app.appendChild(appCanvas);
app.appendChild(clearButton);
