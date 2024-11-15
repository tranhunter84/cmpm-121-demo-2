import DisplayObject from "./displayobject";

export class LineSegment implements DisplayObject {
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