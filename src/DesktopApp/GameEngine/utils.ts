import { XYZ } from '@desktop-app/GameEngine/Classes/RotationShape'

export const rad = deg => (deg * Math.PI) / 180

export const setOrientation = (xyz: XYZ) => `rotateZ(${xyz.rotateX}deg) rotateX(${xyz.rotateY}deg)  rotateY(${xyz.rotateZ}deg)`
