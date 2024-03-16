import React, { Suspense, useEffect, useRef, useState } from 'react'
import GameEngine, { GameDataMessage } from '@desktop-app/GameEngine/Classes/GameEngine'
import ViewPort from '@desktop-app/GameEngine/Tree/ViewPort'
import MoveShape from '@desktop-app/GameEngine/Classes/MoveShape'
import Scene from '@desktop-app/GameEngine/Classes/Scene'
import { SceneView } from '@desktop-app/GameEngine/Tree/SceneView'
import { CameraControls, Html, useProgress, useGLTF, Stars, Select } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { useLoader } from '@react-three/fiber'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'
import { GLTF } from 'three-stdlib'
import { KernelSize, Resolution } from 'postprocessing'

import { Model as Jet2 } from '@assets/orange-jet2/Jet2'

const SceneObjects = [
    MoveShape.Box({ height: 3, width: 2, length: 1, x: 1, y: 2, z: -1 }),
    MoveShape.Box({ height: 2, width: 1, length: 10, x: 5, y: 1, z: -4 }),
    //  MoveShape.Box({ height: 20, width: 20, length: 20, x: 1000, y: 100, z: 0 }),
]

const scene = new Scene(SceneObjects)
const game = new GameEngine(scene)

const Loader = () => {
    const { progress } = useProgress()
    return <Html center>{progress} % loaded</Html>
}
useGLTF.preload('src/assets/jet2.gltf')
const params = {
    threshold: 0,
    strength: 1,
    radius: 0,
    exposure: 1,
}

type GLTFResult = GLTF & {
    nodes: {
        Torus001_1: THREE.Mesh
        Torus001_2: THREE.Mesh
        Torus001_3: THREE.Mesh
    }
    materials: {
        ['tron.001']: THREE.MeshStandardMaterial
        black: THREE.MeshStandardMaterial
        tron: THREE.MeshStandardMaterial
    }
}

const Model: React.FC = () => {
    // const model = useLoader(FBXLoader, 'src/assets/jet.fbx')
    // const groupRef = useRef()
    // @ts-ignore
    const { nodes, materials } = useGLTF('src/assets/jet2.gltf') as GLTFResult
    const material = materials.tron
    material.emissiveIntensity = 2
    return (
        <Suspense fallback={<Loader />}>
            <group dispose={null}>
                <group position={[2, 0, -1]} rotation={[0, Math.PI / 2, -Math.PI / 2]} scale={0.008}>
                    <mesh geometry={nodes.Torus001_1.geometry} material={materials['tron.001']} />
                    <mesh geometry={nodes.Torus001_2.geometry} material={materials.black} />
                    <mesh
                        material-toneMapped={false}
                        material-emissiveIntensity={0.5}
                        material-emissive={new THREE.Color('cyan')}
                        material-color={new THREE.Color('cyan')}
                        geometry={nodes.Torus001_3.geometry}
                        material={material}
                    />
                </group>
            </group>
        </Suspense>
    )
}

const Playground = () => {
    //const [state, setState] = useState(game)

    const onMessage = (message: GameDataMessage) => {
        const newState = game.onMessage(message)
        // @ts-ignore
        setState({ ...newState })
    }

    const [state, setState] = useState({
        intensity: 3.4,
        luminanceThreshold: 0,
        height: undefined,
        width: undefined,
        kernelSize: KernelSize.LARGE,
        luminanceSmoothing: 2.86,
        mipmapBlur: false,
    })

    return (
        <>
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
            <ViewPort>
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight />
                <directionalLight position={[3.3, 1.0, 4.4]} castShadow />
                <CameraControls />

                <Jet2 />
                <Model />
                {/*<SceneView scene={state.scene} />*/}
                <EffectComposer>
                    <Bloom
                        intensity={state.intensity}
                        luminanceThreshold={state.luminanceThreshold}
                        //height={300}
                        // width={300}
                        // blurPass={undefined} // A blur pass.
                        kernelSize={KernelSize.LARGE} // blur kernel size
                        luminanceSmoothing={state.luminanceSmoothing} // smoothness of the luminance threshold. Range is [0, 1]
                        mipmapBlur={state.mipmapBlur} // Enables or disables mipmap blur.
                        //resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
                        //resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
                    />
                </EffectComposer>
            </ViewPort>
        </>
    )
}

export default Playground
