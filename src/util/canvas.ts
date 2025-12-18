import { Color } from "cesium";

export function colorizeCanvas(canvas: HTMLCanvasElement, color: Color){
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)

    for(let y = 0; y < canvas.height; y++){
        for(let x = 0; x < canvas.width; x++){
            const rIndex = y * canvas.width * 4 + x * 4
            const gIndex = rIndex + 1
            const bIndex = rIndex + 2
            const aIndex = rIndex + 3

            const alpha = imageData.data[aIndex]/255
            const combinedAlpha = alpha * color.alpha

            imageData.data[rIndex] = Math.floor(color.red * 255 * combinedAlpha)
            imageData.data[gIndex] = Math.floor(color.green * 255 * combinedAlpha)
            imageData.data[bIndex] = Math.floor(color.blue * 255 * combinedAlpha)
            imageData.data[aIndex] = Math.floor(combinedAlpha * 255)
        }
    }

    canvas.getContext('2d').putImageData(imageData, 0, 0)
}