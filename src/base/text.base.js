import { PointBase } from "./point.base";

export class TextBase extends PointBase {
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
