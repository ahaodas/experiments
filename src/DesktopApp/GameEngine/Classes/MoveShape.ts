import { rad } from '@desktop-app/GameEngine/utils'

export enum MoveShapeType {
    box,
}

type Percent = `${number}%`
export interface MoveShapeProps {
    staticCords?: { top: Percent; left: Percent }
    type: MoveShapeType
    height: number
    width: number
    length: number
    x: number
    y: number
    z: number
    color?: string
    altColor?: string
}

class MoveShapeBase {
    x = 0
    y = 0
    z = 0
    height: number
    width: number
    length: number
    speed = 1
    type: MoveShapeType
    color?: string
    staticCords?: { top: Percent; left: Percent }

    constructor(props: MoveShapeProps) {
        this.x = props.x
        this.y = props.y
        this.z = props.z
        this.type = props.type
        this.length = props.length
        this.width = props.width
        this.height = props.height
        this.color = props.color
        this.staticCords = props.staticCords
    }

    move({ rotateX, rotateZ, rotateY }: { rotateY: number, rotateX: number; rotateZ: number }) {
        const angleZ = rad(-rotateZ)
        const angleX = rad(rotateX)
        const zFilter = Math.cos(-angleX)
        this.x += zFilter * this.speed * Math.sin(angleZ)
        this.z += zFilter * this.speed * Math.cos(angleZ)
        this.y += zFilter * this.speed * Math.sin(rad(rotateY))
    }

    setCords({ x, y, z }: { x: number; y: number; z: number }) {
        this.x = x
        this.z = z
        this.y = y
    }
}

class MoveShape extends MoveShapeBase {
    constructor(props) {
        super(props)
    }
    static Box = (props: Omit<MoveShapeProps, 'type'>) => new MoveShape({ ...props, type: MoveShapeType.box })
}

export default MoveShape
