import p5 from "p5";
import { TextWriteIn, frames, setup2D } from "../src/index";

let p;

export function WriteIn() {
    if (p) {
        p.remove();
    }

    // text write in
    const s = (p) => {
        let text;

        p.setup = function () {
            setup2D(p, 900, 600);
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

    p = new p5(s, "WriteInPanel");
}
