(function (p5) {
    'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var p5__default = /*#__PURE__*/_interopDefaultLegacy(p5);

    const frameRate = 30;

    function frames(sec) {
        return Math.round(frameRate * sec);
    }

    function setup2D(s) {
        s.frameRate(frameRate);
        s.createCanvas(1250, 675);
    }

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
    class Timer0 extends Timer {
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
    class Timer2 extends Timer {
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
    function TimerFactory(frames, mode) {
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

    class PointBase {
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

    class TextBase extends PointBase {
        constructor(ctx, options) {
            super(ctx, options);

            const { rotation = 0 } = options;

            // I originally used the usual syntax of args.x || width / 2,
            // but this would not work if 0 is passed in as x
            this.rotation = rotation;
        }

        reset(args) {
            this.x = args.x || this.x;
            this.y = args.y || this.y;
        }
        // move() merged into parent class
    }

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

    class FillChanger extends ColorChanger {
        constructor(ctx, initColor) {
            super(ctx, initColor);
        }

        advance() {
            if (this.changed) this.changing();
            this.s.fill(this.color);
        }
    }

    class Text extends TextBase {
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

    class TextWriteIn extends Text {
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

    // text write in
    const s = (p) => {
        let text;

        p.setup = function () {
            setup2D(p);
            text = new TextWriteIn(p, {
                str: "Graph Algorithm: Topological sort",
                x: 20,
                y: 20,
                start: frames(0),
            });
        };

        p.draw = function () {
            p.background(0);
            text.show();
            text.reColor([255, 0, 0], 1);
        };
    };

    new p5__default["default"](s);

})(p5);
//# sourceMappingURL=manim.js.map
