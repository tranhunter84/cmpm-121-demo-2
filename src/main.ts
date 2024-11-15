import "./style.css";

// ===================================
// BASIC APP HEADERS & STYLING
const APP_NAME = "HUNTER'S DEMO #2!!";
const app = document.querySelector<HTMLDivElement>("#app")!;
document.title = APP_NAME;
const title = document.createElement("h1");
title.textContent = APP_NAME;
app.appendChild(title);

// ===================================
// INITIALIZATION OF CORE VARIABLES
let isDrawing = false;
let paths: Array<DisplayObject> = [];
let currentPath: LineSegment | null = null;
let undoStack: Array<DisplayObject> = [];
let redoStack: Array<DisplayObject> = [];
let lineThickness = 1;
let toolPreview: ToolPreview | null = null;
let currentEmoji: Emoji | null = null;
let currentTool: "draw" | "sticker" = "draw";

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d")!;
const clearButton = document.createElement("button");
const undoButton = document.createElement("button");
const redoButton = document.createElement("button");
const thinButton = document.createElement("button");
const thickButton = document.createElement("button");
const createEmojiButton = document.createElement("button");
const exportButton = document.createElement("button");
const emojiButtons = [
    { emoji: "🍎", label: "Smile 1" },
    { emoji: "🍌", label: "Smile 2" },
    { emoji: "🍉", label: "Smile 3" }
];

clearButton.textContent = "Clear Canvas";
undoButton.textContent = "Undo";
redoButton.textContent = "Redo";
thinButton.textContent = "Thin Marker";
thickButton.textContent = "Thick Marker";
createEmojiButton.textContent = "Create Your Own Emoji!";
exportButton.textContent = "Export Canvas (PNG)";

canvas.width = 256;
canvas.height = 256;
canvas.style.cursor = "none"; // Hide the default cursor

// ===================================
// INTERFACES
interface DisplayObject {
    display(ctx: CanvasRenderingContext2D): void;
}

// ===================================
// CLASSES
class LineSegment implements DisplayObject {
    private points: { x: number, y: number }[];
    private thickness: number;
    private color: string;  // New property

    constructor(initialX: number, initialY: number, thickness: number, color: string) {
        this.points = [{ x: initialX, y: initialY }];
        this.thickness = thickness;
        this.color = color;  // Initialize color
    }

    addPoint(x: number, y: number) {
        this.points.push({ x, y });
    }

    display(ctx: CanvasRenderingContext2D): void {
        if (this.points.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;  // Set stroke color
        ctx.stroke();
        ctx.closePath();
    }
}

class ToolPreview implements DisplayObject {
    private x: number;
    private y: number;
    private thickness: number;
    private color: string;  // New color property

    constructor(x: number, y: number, thickness: number, color: string) {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
        this.color = color;  // Initialize with the passed color
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D): void {
        const previewSize = this.thickness * 4; // Make the preview 4 times the thickness
        ctx.beginPath();
        ctx.arc(this.x, this.y, previewSize / 2, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;  // Use the tool's color for the preview
        ctx.stroke();
        ctx.closePath();
    }
}

class Emoji implements DisplayObject {
    private x: number;
    private y: number;
    private emoji: string;

    constructor(x: number, y: number, emoji: string) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D): void {
        ctx.font = "30px Arial";
        ctx.fillText(this.emoji, this.x - 15, this.y + 10);  // Adjust the positioning to center
    }
}

// ===================================
// HELPER FUNCTIONS
function createLineSegment(initialX: number, initialY: number, thickness: number): LineSegment {
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;  // Randomize color using HSL
    return new LineSegment(initialX, initialY, thickness, color);
}

function createToolPreview(initialX: number, initialY: number, thickness: number, color: string): ToolPreview {
    return new ToolPreview(initialX, initialY, thickness, color);  // Pass color to ToolPreview
}

function createEmoji(x: number, y: number, emoji: string): Emoji {
    return new Emoji(x, y, emoji);
}

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    paths.forEach((path) => {
        path.display(context);
    });
    if(currentPath) {
        currentPath?.display(context);
    }

    if (!isDrawing && toolPreview) {
        toolPreview.display(context);
    }
    if (currentEmoji) {
        currentEmoji.display(context);
    }
}

function selectTool(button: HTMLButtonElement, thickness: number) {
    currentTool = "draw";
    lineThickness = thickness;
    const randomColor = `hsl(${Math.random() * 360}, 100%, 50%)`; // Randomize the color
    toolPreview = createToolPreview(0, 0, lineThickness, randomColor); // Pass random color
    context.strokeStyle = randomColor; // Set random color for the drawing tool
    document.querySelectorAll(".selectedTool").forEach(btn => btn.classList.remove("selectedTool"));
    button.classList.add("selectedTool");
}

function selectEmoji(emoji: string) {
    currentTool = "sticker";
    currentEmoji = createEmoji(0, 0, emoji);
    toolPreview = null; // No drawing tool preview when using stickers
}

function exportCanvas() {
    const tempCanvas = document.createElement("canvas");  // Temporary canvas sized 1024x204
    const exportContext = tempCanvas.getContext("2d")!;
    
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    exportContext.scale(4, 4);

    paths.forEach((path) => {   // Redraws paths onto the temp canvas
        path.display(exportContext);
    });

    tempCanvas.toBlob((blob) => {   // Trigger the download
        if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "canvas-export.png";
            link.click();
            URL.revokeObjectURL(url);
        }
    });
}

// ===================================
// ADD EVENT LISTENERS TO PAGE ELEMENTS
canvas.addEventListener("mousedown", (event) => {
    if (currentTool === "draw") {
        isDrawing = true;
        currentPath = createLineSegment(event.offsetX, event.offsetY, lineThickness);
    } else if (currentTool === "sticker" && currentEmoji) {
        currentEmoji.updatePosition(event.offsetX, event.offsetY);
        paths.push(currentEmoji);
        currentEmoji = null;
    }
});

canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing && currentTool === "draw") {
        if (toolPreview) {
            toolPreview.updatePosition(event.offsetX, event.offsetY);
        }
        canvas.dispatchEvent(new Event("tool-moved"));
    } else if (!isDrawing && currentTool === "sticker" && currentEmoji) {
        currentEmoji.updatePosition(event.offsetX, event.offsetY);
        canvas.dispatchEvent(new Event("tool-moved"));
    } else if (isDrawing && currentPath) {
        currentPath.addPoint(event.offsetX, event.offsetY);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

canvas.addEventListener("mouseup", () => {
    if (currentPath) {
        paths.push(currentPath);
        currentPath = null;
        redoStack = [];
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
    isDrawing = false;
});

canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("tool-moved", redraw);

undoButton.addEventListener("click", () => {
    if (paths.length > 0) {
        const lastPath = paths.pop();
        if (lastPath) undoStack.push(lastPath);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

redoButton.addEventListener("click", () => {
    if (undoStack.length > 0) {
        const lastUndo = undoStack.pop();
        if (lastUndo) {
            paths.push(lastUndo);
            redoStack.push(lastUndo);
        }
        canvas.dispatchEvent(new Event("drawing-changed"));
    }   
});

clearButton.addEventListener("click", () => {
    paths = [];
    undoStack = [];
    redoStack = [];
    context.clearRect(0, 0, canvas.width, canvas.height);
});

thinButton.addEventListener("click", () => {
    selectTool(thinButton, 2);  // Apply random color to the tool
});

thickButton.addEventListener("click", () => {
    selectTool(thickButton, 10);
});

createEmojiButton.addEventListener("click", () => {   // Button for user to create a emoji
    const emoji = prompt("Input your own emoji to create a new emoji:", "😎");    // Ensure a real emoji character is pasted in
    if (emoji) {
        const button = document.createElement("button");
        button.textContent = emoji;
        button.addEventListener("click", () => selectEmoji(emoji));
        app.appendChild(button);
    }
});

// Create buttons dynamically
emojiButtons.forEach(emoji => {
    const button = document.createElement("button");
    button.textContent = emoji.emoji;
    button.addEventListener("click", () => selectEmoji(emoji.emoji));
    app.appendChild(button);
});

exportButton.addEventListener("click", exportCanvas);

// ===================================
// MAIN PROGRAM
app.appendChild(canvas);
app.appendChild(undoButton);
app.appendChild(redoButton);
app.appendChild(clearButton);
app.appendChild(thinButton);
app.appendChild(thickButton);
app.appendChild(createEmojiButton);
app.appendChild(exportButton);

selectTool(thinButton, 2); // Create the initial tool preview object when the app starts