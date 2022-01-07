import p5 from "p5";
import { TextWriteIn, frames, setup2D } from "./index";

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

const p = new p5(s);
