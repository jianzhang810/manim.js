const frameRate = 30;

export function frames(sec) {
    return Math.round(frameRate * sec);
}

export function setup2D(s, width, height) {
    s.frameRate(frameRate);
    s.createCanvas(width, height);
}
