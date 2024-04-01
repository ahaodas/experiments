import React from 'react'
import { KernelSize } from 'postprocessing'
import ViewPort from '@desktop-app/GameEngine/Tree/ViewPort'
import { Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

export const GraphicWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
    const graphicOptions = {
        intensity: 3.4,
        luminanceThreshold: 0,
        height: undefined,
        width: undefined,
        kernelSize: KernelSize.LARGE,
        luminanceSmoothing: 2.86,
        mipmapBlur: false,
    }
    return (
        <ViewPort>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight />
            <directionalLight position={[3.3, 1.0, 4.4]} castShadow />
            {children}
            <EffectComposer>
                <Bloom
                    intensity={graphicOptions.intensity}
                    luminanceThreshold={graphicOptions.luminanceThreshold}
                    kernelSize={KernelSize.LARGE}
                    luminanceSmoothing={graphicOptions.luminanceSmoothing}
                    mipmapBlur={graphicOptions.mipmapBlur}
                />
            </EffectComposer>
        </ViewPort>
    )
}
