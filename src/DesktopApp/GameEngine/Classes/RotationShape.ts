export interface XYZ {
    rotateX: number
    rotateY: number
    rotateZ: number
}

class RotationShape {
    rotateX = 0
    rotateY = 0
    rotateZ = 0
    constructor() {}

    rotate(position: XYZ, invert?: boolean) {
        const d = invert ? -1 : 1
        this.rotateX = -position.rotateX * d
        this.rotateY = -position.rotateY * d
        this.rotateZ = -position.rotateZ * d
    }

    get rotation() {
        return {
            rotateX: this.rotateX,
            rotateY: this.rotateY,
            rotateZ: this.rotateZ,
        }
    }
}

export default RotationShape