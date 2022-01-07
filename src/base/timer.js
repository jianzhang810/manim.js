class Timer {
    constructor(frames) {
        this.frames = frames;
        this.f = 1;
        this.t = 0;
    }

    advance() {} // to be overridden
}

/*** Timer0
 * constant speed
 */
export class Timer0 extends Timer {
    constructor(frames) {
        super(frames);
        this.v = 1 / frames;
    }

    advance() {
        this.f++;
        if (this.t < 0.99) {
            this.t += this.v;
        }
        return this.t;
    }
}

/*** Timer1
 * keep decelerating
 */
class Timer1 extends Timer {
    constructor(frames) {
        super(frames);
        this.a = -2 / (frames * frames);

        // Since time is updated before velocity is updated, the integral is a left Riemann Sum,
        // so in the end this.t will be larger than expected (smaller if use the right Riemann Sum).
        // To get around this, reduce initial velocity by exactly 1/frames^2.
        // This way this.t will end up at 1.
        this.v = 2 / frames - 1 / (frames * frames);
    }

    advance() {
        // seems that controlling the end result purely through calculus may render this.t
        // not exactly 1 at the end of animation. So we need to force it to 1.
        if (this.f >= this.frames) return 1;

        if (this.v > 0) {
            this.t += this.v;
            this.v += this.a;
        }
        this.f++;
        return this.t;
    }
}

/** Timer2
 * accelerate then decelerate
 */
export class Timer2 extends Timer {
    constructor(frames) {
        super(frames);
        this.v = 0;
        this.a = 4 / (frames * frames);
    }

    advance() {
        // seems that controlling the end result purely through calculus may render this.t
        // not exactly 1 at the end of animation. So we need to force it to 1.
        if (this.f > this.frames) return 1;

        if (this.t < 0.5) {
            this.t += this.v;
            if (this.t < 0.5) {
                // fixme
                this.v += this.a;
            }
        } else if (this.v > 0) {
            this.v -= this.a;
            this.t += this.v;
        }

        this.f++;
        return this.t;
    }
}

/*** 2019-02-01
 * This Factory function is responsible for constructing the appropriate timer class
 * Default is return Timer2
 */
export function TimerFactory(frames, mode) {
    if (mode === 0) {
        return new Timer0(frames);
    } else if (mode === 1) {
        return new Timer1(frames);
    } else if (mode === 2) {
        return new Timer2(frames);
    } else {
        return new Timer2(frames);
    }
}
