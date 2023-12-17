export class Image {
    imageData: ImageData;
    size: { width: number, height: number };

    constructor(
        imageData: ImageData,
        size: { width: number, height: number },
    ) {
        this.imageData = imageData;
        this.size = size;
    }

    // puts a pixel at the point with the selected color
    putPixel(
        point: { x: number, y: number },
        color: [number, number, number, number]
    ) {
        // return if outside of canvas
        if (point.x >= this.size.width || point.x < 0 || point.y >= this.size.height || point.y < 0) return;
        // 4 times to skip all color channels
        let index = 4 * (point.x + point.y * this.imageData.width);
        let pixels = this.imageData.data;
        pixels[index] = color[0];
        pixels[index + 1] = color[1];
        pixels[index + 2] = color[2];
        pixels[index + 3] = color[3];
    }

    getPixel(point: { x: number, y: number }) {
        let color: [number, number, number, number] = [0, 0, 0, 0];

        // 4 times to skip all color channels
        let index = 4 * (point.x + point.y * this.imageData.width);
        let pixels = this.imageData.data;
        color[0] = pixels[index];
        color[1] = pixels[index + 1];
        color[2] = pixels[index + 2];
        color[3] = pixels[index + 3];

        return color;
    }
}
