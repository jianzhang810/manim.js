import server from "rollup-plugin-serve";

const plugins = [];

const dev = process.argv.indexOf("-w") > -1;

if (dev) {
    plugins.push(
        server({
            open: "true",
            contentBase: "./",
        })
    );
}

export default {
    input: "src/examples.js",
    output: {
        file: "dist/manim.js",
        name: "manim",
        format: "iife",
        sourcemap: true,
        globals: {
            p5: "p5",
        },
    },
    external: ["p5"],
    plugins: plugins.concat([]),
};
