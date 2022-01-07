import { frames } from "./utils";
import { TimerFactory, Timer2 } from "./timer";

export class PointBase {
    constructor(ctx, options) {
        const {
            x = 0,
            y = 0,
            start = 30,
            duration = 1,
            end = 100000,
        } = options;

        this.s = ctx;
        this.x = x;
        this.y = y;
        this.start = start;
        this.start = Math.floor(this.start);
        this.duration = duration; // fixme
        this.end = end;
        this.end = Math.floor(this.end);
    }

    shift(x, y, duration, timerNum) {
        this.move(this.x + x, this.y + y, duration, timerNum);
    }

    /*** move(), 2019-02-01
     * Moves to a location with respect to the p5 coordinate
     * In s.draw(), use if (s.frameCount === [t]) [var].move(...);
     *
     * --- arg list ---
     * duration is in seconds, not frames
     */
    move(x, y, duration, timerNum) {
        this.xo = this.x;
        this.xd = x;
        this.yo = this.y;
        this.yd = y;
        this.moved = true;
        this.move_duartion = frames(1);
        if (duration) this.move_duartion = frames(duration);

        this.f = 0;
        this.move_timer = TimerFactory(this.move_duartion, timerNum);
    }

    moving() {
        if (this.f < this.move_duartion) {
            let t = this.move_timer.advance();
            this.x = this.xo + t * (this.xd - this.xo);
            this.y = this.yo + t * (this.yd - this.yo);
            this.f++;
        } else {
            this.moved = false;
        }
    }

    /*** shake(), 2019-02-17
     * Shake vertically as emphasis
     * In s.draw(), use if (s.frameCount === [t]) [var].shake(...);
     *
     * --- arg list ---
     * @param amp - amplitude in pixels
     * @param duration - in seconds
     */
    shake(amp, duration) {
        this.yo = this.y;
        this.amp = amp;
        this.shaked = true;
        this.move_duartion = frames(1);
        if (duration) this.move_duartion = frames(duration);
        this.f = 0;
        this.move_timer = new Timer2(this.move_duartion);
    }

    jump(amp, duration) {
        this.yo = this.y;
        this.amp = amp;
        this.jumped = true;
        this.move_duartion = frames(1);
        if (duration) this.move_duartion = frames(duration);
        this.f = 0;
        this.move_timer = new Timer2(this.move_duartion);
    }

    shaking() {
        if (this.f <= this.move_duartion) {
            let t = this.move_timer.advance() * this.s.TWO_PI;
            this.y = this.yo - this.amp * Math.sin(t);
            this.f++;
        } else {
            this.shaked = false;
        }
    }

    jumping() {
        if (this.f <= this.move_duartion) {
            let t = this.move_timer.advance() * this.s.PI;
            this.y = this.yo - this.amp * Math.sin(t);
            this.f++;
        } else {
            this.jumped = false;
        }
    }

    // to be called at the beginning of the show() function of derived classes
    // move() and shake() cannot happen at the same time
    showMove() {
        if (this.moved) this.moving();
        else if (this.shaked) this.shaking();
        else if (this.jumped) this.jumping();
    }

    show() {}
}
