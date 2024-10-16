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
const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!; 
const clearButton = document.createElement("button");
let isDrawing = false;
let paths: Array<Array<{ x: number, y: number }>> = [];
let currentPath: Array<{ x: number, y: number }> = [];

clearButton.textContent = "Clear Canvas";
canvas.width = 256;
canvas.height = 256;

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
        context.beginPath();
        path.forEach((point, index) => {
            index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y);
        });
        context.stroke();
        context.closePath();
    });
}

// ===================================
// ADD EVENT LISTENERS TO PAGE ELEMENTS
canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    currentPath = [{ x: event.offsetX, y: event.offsetY }];
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    const point = { x: event.offsetX, y: event.offsetY };
    currentPath.push(point);
    canvas.dispatchEvent(new Event("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
    if (currentPath.length) {
        paths.push(currentPath);
        currentPath = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
    isDrawing = false;
});

// ===================================
// OBSERVER FOR "drawing-changed" EVENT
canvas.addEventListener("drawing-changed", redraw);

// ===================================
// CLEAR BUTTON TO RESET CANVAS
clearButton.addEventListener("click", () => {
    paths = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// ===================================
// MAIN PROGRAM
app.appendChild(canvas);
app.appendChild(clearButton);
