import DisplayObject from "./displayobject";

export class Emoji implements DisplayObject {
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