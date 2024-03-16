import React from 'react'
import { Canvas } from '@react-three/fiber'

const ViewPort: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <div style={{ height: '100%' }} id="canvas-container">
            <Canvas camera={{ fov: 45 }}>{children}</Canvas>
        </div>
    )
}
export default ViewPort
