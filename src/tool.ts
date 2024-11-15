import DisplayObject from "./displayobject";

export class ToolPreview implements DisplayObject {
	private x: number;
	private y: number;
	private thickness: number;
	private color: string; // New color property

	constructor(x: number, y: number, thickness: number, color: string) {
		this.x = x;
		this.y = y;
		this.thickness = thickness;
		this.color = color; // Initialize with the passed color
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
		ctx.strokeStyle = this.color; // Use the tool's color for the preview
		ctx.stroke();
		ctx.closePath();
	}
}
