import RotationShape, { XYZ } from '@desktop-app/GameEngine/Classes/RotationShape'
import MoveShape from '@desktop-app/GameEngine/Classes/MoveShape'
import { rad } from '@desktop-app/GameEngine/utils'

export class Scene {
    containerShape: RotationShape
    children: MoveShape[]
    aim: MoveShape

    constructor(children: MoveShape[] = []) {
        this.containerShape = new RotationShape()
        this.children = children
    }

    addAim(
        shape = MoveShape.Box({
            staticCords: { top: '50%', left: '50%' },
            height: 1000,
            width: 1000,
            length: 1000,
            x: 0,
            z: 0,
            y: 0,
            color: 'yellow',
        })
    ) {
        this.aim = shape
    }

    rotate(xyz: XYZ) {
        this.container.rotate(xyz)
        this.aim && this.aim.setCords(this.aimCords)
    }

    moveChildren() {
        const { rotateX, rotateZ, rotateY } = this.containerShape.rotation
        this.children.forEach(x => x.move({ rotateX, rotateZ, rotateY }))
    }

    injectChild(child: MoveShape) {
        this.children.push(child)
    }

    clearChildren(range: number) {
        this.children = this.children.filter(({ z }) => z < range)
    }

    get container() {
        return this.containerShape
    }

    get childShapes() {
        return this.children
    }

    get aimCords() {
        const r = 100
        const z = -r * Math.cos(rad(this.containerShape.rotateZ))
        const x = r * Math.sin(rad(this.containerShape.rotateZ))
        const y = -r * Math.sin(rad(this.containerShape.rotateY))
        return {
            x,
            z: z, // - 8000,
            y,
        }
    }
}

export default Scene
