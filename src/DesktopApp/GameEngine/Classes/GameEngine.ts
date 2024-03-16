import Scene from '@desktop-app/GameEngine/Classes/Scene'
import MoveShape from '@desktop-app/GameEngine/Classes/MoveShape'

export interface GameDataMessage {
    rotateX: number
    rotateY: number
    rotateZ: number
    move: boolean
}
class GameEngine {
    scene: Scene
    tick = 0

    constructor(scene: Scene) {
        this.scene = scene
        this.scene.addAim()
    }

    onMessage = ({ move, ...message }: GameDataMessage) => {
        requestAnimationFrame(() => this.scene.rotate(message))
        if (move) {
            this.tick++
            if (!(this.tick % Math.round(Math.random() * 20) + 20)) {
                this.scene.clearChildren(200)
                const { z, x, y } = this.scene.aimCords
                const sx =
                        (!x ? Math.random() : x + Math.round(x * Math.random())) * (Math.round(Math.random()) ? 1 : -1),
                    sy = (!y ? Math.random() : y + Math.round(y * Math.random())) * (Math.round(Math.random()) ? 1 : -1)
                this.scene.injectChild(
                    MoveShape.Box({
                        staticCords: { top: '50%', left: '50%' },
                        height: Math.round(Math.random() * 10),
                        width: Math.round(Math.random() * 10),
                        length: Math.round(Math.random() * 10),
                        z: z,// - 9000,
                        x: sx,
                        y: sy,
                    })
                )
            }
            requestAnimationFrame(() => this.scene.moveChildren())
        }
        return this
    }
    get currentScene() {
        return this.scene
    }
}

export default GameEngine
