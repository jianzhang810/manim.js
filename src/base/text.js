import { TextBase } from "./text.base";
import { FillChanger } from "./color.change";

export class Text extends TextBase {
    constructor(ctx, options) {
        super(ctx, options);

        const {
            font,
            str,
            mode = 0,
            color = [255, 255, 255],
            stroke,
            strokeweight = 1.7,
            size = 37,
        } = options;

        this.font = font;
        this.str = str;
        this.mode = mode;
        this.color = color;
        this.ft = new FillChanger(ctx, this.color);
        this.stroke = stroke;
        this.sw = strokeweight;

        this.size = size;
    }

    reColor(color, duration) {
        this.ft.reColor(color, duration);
    }

    move(x, y, duration, timerNum, size) {
        super.move(x, y, duration, timerNum);
        this.so = this.size;
        this.sn = size || this.size;
    }

    moving() {
        super.moving();
        this.size = this.so + this.move_timer.t * (this.sn - this.so);
    }

    shaking() {
        super.shaking();
        if (this.mode === 1)
            // changing size only works if text is in the center
            this.size +=
                Math.sin(this.move_timer.t * this.s.TWO_PI) * this.amp * 0.27;
    }

    jumping() {
        super.jumping();
        if (this.mode === 1)
            // the integral of sin(2*PI*x) over 0 to 2*PI is 0, so position doesn't change
            this.size +=
                Math.sin(this.move_timer.t * this.s.TWO_PI) * this.amp * 0.27;
    }

    // works the same way as move
    change(str, duration) {
        // todo
        this.reset({ str: str });
    }

    reset(options) {
        const { x, y, size, str } = options;

        this.x = x || this.x;
        this.y = y || this.y;
        this.size = size || this.size;
        this.str = str || this.str;
    }

    showSetup() {
        if (this.font) this.s.textFont(this.font);

        if (this.mode === 0) {
            this.s.textAlign(this.s.LEFT, this.s.TOP);
        } else if (this.mode === 1) {
            this.s.textAlign(this.s.CENTER, this.s.CENTER);
        } else if (this.mode === 2) {
            this.s.textAlign(this.s.RIGHT, this.s.TOP);
        } else if (this.mode === 3) {
            // center-right
            this.s.textAlign(this.s.LEFT, this.s.CENTER);
        } else if (this.mode === 4) {
            // center-right
            this.s.textAlign(this.s.RIGHT, this.s.CENTER);
        }
        this.s.textSize(this.size);
        this.ft.advance(); // show color

        if (this.stroke) {
            this.s.strokeWeight(this.sw);
            this.s.stroke(this.stroke);
        } else this.s.noStroke();
        this.showMove();
    }

    show() {
        if (this.s.frameCount >= this.start && this.s.frameCount < this.end) {
            this.showSetup();
            this.s.fill(this.color);

            this.s.text(this.str, this.x, this.y);
        }
    }
}
