const frameRate = 30;

export function frames(sec) {
    return Math.round(frameRate * sec);
}

export function setup2D(s) {
    s.frameRate(frameRate);
    s.createCanvas(1250, 675);
}
