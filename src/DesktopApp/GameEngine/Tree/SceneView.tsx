import React, { useEffect, useRef } from 'react'
import Scene from '@desktop-app/GameEngine/Classes/Scene'
import BasicShader, { MaterialProps } from '@shaders/basic'
import { Color, DoubleSide, PlaneGeometry } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { Backdrop, Stars } from '@react-three/drei'
import { Geometry } from 'three/examples/jsm/deprecated/Geometry'

export const SceneView: React.FC<{ scene: Scene }> = () => {
    const { gl, scene } = useThree()
    useEffect(() => {
        // Observe a scene or a renderer
        // @ts-ignore
        if (typeof window.__THREE_DEVTOOLS__ !== 'undefined') {
            // @ts-ignore
            window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: scene }))
            // @ts-ignore
            window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', { detail: gl }))
        }
    }, [])
    const ref = useRef<MaterialProps>()
    const gRef = useRef<PlaneGeometry>()
    console.log(gRef.current)
    useFrame(({ clock }) => (ref.current.time = clock.getElapsedTime() * 5))
    return (
        <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <mesh position={[0, 0, 0]}>
                {/*<boxGeometry args={[10, 2, 2, 1, 1]} />*/}
                <planeGeometry ref={gRef} args={[4, 1, 10, 10]} />
                <BasicShader side={DoubleSide} depthWrite={false} transparent ref={ref} color={new Color('magenta')} />
            </mesh>
        </>
    )
}
