import React, { useState } from 'react'
import { KernelSize } from 'postprocessing'
import ViewPort from '@desktop-app/GameEngine/Tree/ViewPort'
import { Stars } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'

export const GraphicWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, setState] = useState({
        intensity: 3.4,
        luminanceThreshold: 0,
        height: undefined,
        width: undefined,
        kernelSize: KernelSize.LARGE,
        luminanceSmoothing: 2.86,
        mipmapBlur: false,
    })
    const [settings, setSettings] = useState(false)

    return (
        <>
            <div style={{ position: 'absolute', zIndex: 999 }}>
                <button onClick={() => setSettings(x => !x)}>{settings ? 'Close' : 'Open'} settings</button>
                <div style={{ display: settings ? 'block' : 'none' }}>
                    <div>
                        <div style={{ color: 'white' }}>luminanceThreshold {state.luminanceThreshold}</div>
                        <input
                            value={state.luminanceThreshold}
                            type="range"
                            step={0.01}
                            min={0}
                            max={10}
                            onChange={e => {
                                setState(x => ({
                                    ...x,
                                    luminanceThreshold: parseFloat(e.target.value),
                                }))
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ color: 'white' }}>intensity {state.intensity}</div>
                        <input
                            value={state.intensity}
                            type="range"
                            step={0.1}
                            min={0}
                            max={10}
                            onChange={e => {
                                setState(x => ({
                                    ...x,
                                    intensity: parseFloat(e.target.value),
                                }))
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ color: 'white' }}>luminanceSmoothing {state.luminanceSmoothing}</div>
                        <input
                            value={state.luminanceSmoothing}
                            type="range"
                            step={0.01}
                            min={0}
                            max={10}
                            onChange={e => {
                                setState(x => ({
                                    ...x,
                                    luminanceSmoothing: parseFloat(e.target.value),
                                }))
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ color: 'white' }}>mipmapBlur {state.mipmapBlur}</div>
                        <input
                            checked={state.mipmapBlur}
                            type="checkbox"
                            onChange={e => {
                                setState(x => ({
                                    ...x,
                                    mipmapBlur: e.target.checked,
                                }))
                            }}
                        />
                    </div>
                </div>
            </div>
            <ViewPort>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight />
                <directionalLight position={[3.3, 1.0, 4.4]} castShadow />
                {children}
                <EffectComposer>
                    <Bloom
                        intensity={state.intensity}
                        luminanceThreshold={state.luminanceThreshold}
                        kernelSize={KernelSize.LARGE}
                        luminanceSmoothing={state.luminanceSmoothing}
                        mipmapBlur={state.mipmapBlur}
                    />
                </EffectComposer>
            </ViewPort>
        </>
    )
}
