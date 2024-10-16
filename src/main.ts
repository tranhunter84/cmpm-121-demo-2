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
const undoButton = document.createElement("button");
const redoButton = document.createElement("button");

let isDrawing = false;
let paths: Array<Array<{ x: number, y: number }>> = [];
let currentPath: Array<{ x: number, y: number }> = [];
let undoStack: Array<Array<{ x: number, y: number }>> = [];
let redoStack: Array<Array<{ x: number, y: number }>> = [];

clearButton.textContent = "Clear Canvas";
undoButton.textContent = "Undo";
redoButton.textContent = "Redo";

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
        redoStack = []; // Clear the redo stack whenever a new path is drawn
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
    isDrawing = false;
});

// ===================================
// OBSERVER FOR "drawing-changed" EVENT
canvas.addEventListener("drawing-changed", redraw);

// ===================================
// UNDO BUTTON FUNCTIONALITY
undoButton.addEventListener("click", () => {
    if (paths.length > 0) {
        const lastPath = paths.pop();
        if (lastPath) {
            undoStack.push(lastPath); // Add the last path to the undo stack
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

// ===================================
// REDO BUTTON FUNCTIONALITY
redoButton.addEventListener("click", () => {
    if (undoStack.length > 0) {
        const lastUndo = undoStack.pop();
        if (lastUndo) {
            paths.push(lastUndo); // Move the path from undo stack to paths
            redoStack.push(lastUndo); // Add to redo stack for redo functionality
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

// ===================================
// CLEAR BUTTON TO RESET CANVAS
clearButton.addEventListener("click", () => {
    paths = [];
    undoStack = [];
    redoStack = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
});

// ===================================
// MAIN PROGRAM
app.appendChild(canvas);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(clearButton);
