import { frames } from "./utils";
import { Timer0 } from "./timer";

/*** 2019-04-23
 * THIS CLASS SHOULD NOT BE USED. ONLY USE ITS DERIVED CLASS, StrokeChanger OR FillChanger
 *
 * This timer is responsible for setting the stroke/fill value and
 * displaying color change for objects, via change(), which behaves like move().
 */
class ColorChanger {
    constructor(ctx, initColor) {
        this.s = ctx;
        this.color = initColor || [255, 255, 255, 255];
    }

    fadeOut(duration) {
        let c = deep_copy(this.color);
        this.color[3] = this.color[3] !== undefined ? this.color[3] : 255;
        c[3] = 0;
        this.reColor(c, duration);
    }

    reColor(newColor, duration) {
        this.co = this.color;
        this.cd = newColor;
        this.changed = true;
        this.f = 0;
        this.duartion = frames(1);
        if (duration) this.duartion = frames(duration);
        this.timer = new Timer0(this.duartion);
    }

    changing() {
        if (this.f < this.duartion) {
            let t = this.timer.advance();
            let o = this.co;
            let d = this.cd;
            if (this.color[3] === undefined) {
                this.color = [
                    o[0] + t * (d[0] - o[0]),
                    o[1] + t * (d[1] - o[1]),
                    o[2] + t * (d[2] - o[2]),
                ];
            } else {
                this.color = [
                    o[0] + t * (d[0] - o[0]),
                    o[1] + t * (d[1] - o[1]),
                    o[2] + t * (d[2] - o[2]),
                    o[3] + t * (d[3] - o[3]),
                ];
            }
            this.f++;
        } else this.changed = false;
    }
}

export class StrokeChanger extends ColorChanger {
    constructor(ctx, initColor) {
        super(ctx, initColor);
    }

    advance() {
        if (this.changed) this.changing();
        this.s.stroke(this.color);
    }
}

export class FillChanger extends ColorChanger {
    constructor(ctx, initColor) {
        super(ctx, initColor);
    }

    advance() {
        if (this.changed) this.changing();
        this.s.fill(this.color);
    }
}
