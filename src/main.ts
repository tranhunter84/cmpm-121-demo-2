import "./style.css";

// ===================================
// BASIC APP HEADERS & STYLING
const APP_TITLE = "HUNTER'S DEMO #2!!";
const appElement = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_TITLE;
const headerElement = document.createElement("h1");
headerElement.textContent = APP_TITLE;
appElement.appendChild(headerElement);

// ===================================
// INITIALIZATION OF CORE ELEMENTS
const canvasElement = document.createElement("canvas");
const canvasContext = canvasElement.getContext("2d")!;
const clearCanvasButton = document.createElement("button");
const undoDrawingButton = document.createElement("button");
const redoDrawingButton = document.createElement("button");
const thinMarkerButton = document.createElement("button");
const thickMarkerButton = document.createElement("button");

let isCurrentlyDrawing = false;
let drawnPaths: Array<Drawable> = [];
let activePath: LinePath | null = null;
let undoHistory: Array<Drawable> = [];
let redoHistory: Array<Drawable> = [];
let selectedLineWidth = 1;

clearCanvasButton.textContent = "Clear Canvas";
undoDrawingButton.textContent = "Undo";
redoDrawingButton.textContent = "Redo";
thinMarkerButton.textContent = "Thin Marker";
thickMarkerButton.textContent = "Thick Marker";

canvasElement.width = 256;
canvasElement.height = 256;

// ===================================
// INTERFACES
interface Drawable {
  render(ctx: CanvasRenderingContext2D): void;
}

interface LinePath extends Drawable {
  addPoint(x: number, y: number): void;
}

// ===================================
// HELPER FUNCTIONS
function createLinePath(startX: number, startY: number, thickness: number): LinePath {
  const points: { x: number, y: number }[] = [{ x: startX, y: startY }];

  return {
    addPoint(x: number, y: number) {
      points.push({ x, y });
    },
    render(ctx: CanvasRenderingContext2D) {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const point of points) {
        ctx.lineTo(point.x, point.y);
      }
      ctx.lineWidth = thickness;
      ctx.stroke();
      ctx.closePath();
    }
  };
}

function refreshCanvas() {
  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
  drawnPaths.forEach((path) => {
    path.render(canvasContext);
  });
}

function updateSelectedTool(button: HTMLButtonElement, thickness: number) {
  selectedLineWidth = thickness;
  document.querySelectorAll(".selectedTool").forEach(btn => btn.classList.remove("selectedTool"));
  button.classList.add("selectedTool");
}

// ===================================
// EVENT LISTENERS
canvasElement.addEventListener("mousedown", (event) => {
  isCurrentlyDrawing = true;
  activePath = createLinePath(event.offsetX, event.offsetY, selectedLineWidth);
});

canvasElement.addEventListener("mousemove", (event) => {
  if (!isCurrentlyDrawing || !activePath) return;
  activePath.addPoint(event.offsetX, event.offsetY);
  canvasElement.dispatchEvent(new Event("canvas-updated"));
});

canvasElement.addEventListener("mouseup", () => {
  if (activePath) {
    drawnPaths.push(activePath);
    activePath = null;
    redoHistory = [];
    canvasElement.dispatchEvent(new Event("canvas-updated"));
  }
  isCurrentlyDrawing = false;
});

canvasElement.addEventListener("canvas-updated", refreshCanvas);

undoDrawingButton.addEventListener("click", () => {
  if (drawnPaths.length > 0) {
    const lastPath = drawnPaths.pop();
    if (lastPath) undoHistory.push(lastPath);
    canvasElement.dispatchEvent(new Event("canvas-updated"));
  }
});

redoDrawingButton.addEventListener("click", () => {
  if (undoHistory.length > 0) {
    const lastUndo = undoHistory.pop();
    if (lastUndo) {
      drawnPaths.push(lastUndo);
      redoHistory.push(lastUndo);
    }
    canvasElement.dispatchEvent(new Event("canvas-updated"));
  }
});

clearCanvasButton.addEventListener("click", () => {
  drawnPaths = [];
  undoHistory = [];
  redoHistory = [];
  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
});

thinMarkerButton.addEventListener("click", () => updateSelectedTool(thinMarkerButton, 1));
thickMarkerButton.addEventListener("click", () => updateSelectedTool(thickMarkerButton, 5));

// ===================================
// MAIN PROGRAM
appElement.appendChild(canvasElement);
appElement.appendChild(undoDrawingButton);
appElement.appendChild(redoDrawingButton);
appElement.appendChild(clearCanvasButton);
appElement.appendChild(thinMarkerButton);
appElement.appendChild(thickMarkerButton);
