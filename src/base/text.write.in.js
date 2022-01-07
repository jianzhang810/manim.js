import { Text } from "./text";

export class TextWriteIn extends Text {
    constructor(ctx, args) {
        super(ctx, args);
        this.frCount = 0;
        this.len = this.str.length;
        this.txt = "";
    }
    show() {
        if (this.s.frameCount >= this.start) {
            this.showSetup();
            if (this.frCount < this.len) {
                this.txt += this.str[this.frCount];
                this.frCount++;
            }
            this.s.text(this.txt, this.x, this.y);
        }
    }
}
