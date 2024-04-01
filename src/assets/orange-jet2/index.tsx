import * as THREE from 'three'
import React, { useEffect, useRef, useState } from 'react'
import { Model } from './Jet2'
import Keyboard from '@desktop-app/GameEngine/Camera/DebugUi/Keyboard'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { easeCubicInOut } from 'd3-ease'

export const initialR = {
    rX: -1.7453292519943293,
    rY: -3.1415926535897922,
    rZ: -4.712388980384687,
}

const ROTATION_SPEED = 0.01
const MOVE_SPEED = 0.1
const INNER_ROTATION_MODE = 100
const INNER_ROTATION_RAD = (Math.PI / 12) * INNER_ROTATION_MODE

const kb = new Keyboard()
const Jet2 = props => {
    const [speed, setSpeed] = useState(0)
    const [srX, setSRX] = useState(0)
    const [srY, setSRY] = useState(0)
    const [srZ, setSRZ] = useState(0)

    useEffect(() => {
        kb.keyDown.set('Space', () => setSpeed(MOVE_SPEED))
        kb.shitKeyDown.set('Space', () => setSpeed(-MOVE_SPEED))
        kb.keyUp.set('Space', () => setSpeed(0))

        kb.keyDown.set('KeyW', () => setSRX(-ROTATION_SPEED))
        kb.keyUp.set('KeyW', () => setSRX(0))

        kb.keyDown.set('KeyS', () => setSRX(ROTATION_SPEED))
        kb.keyUp.set('KeyS', () => setSRX(0))

        kb.keyDown.set('KeyQ', () => setSRY(ROTATION_SPEED))
        kb.keyUp.set('KeyQ', () => setSRY(0))

        kb.keyDown.set('KeyE', () => setSRY(-ROTATION_SPEED))
        kb.keyUp.set('KeyE', () => setSRY(0))

        kb.keyDown.set('KeyA', () => setSRZ(ROTATION_SPEED))
        kb.keyUp.set('KeyA', () => setSRZ(0))

        kb.keyDown.set('KeyD', () => setSRZ(-ROTATION_SPEED))
        kb.keyUp.set('KeyD', () => setSRZ(0))

        kb.init()
        return () => kb.destroy()
    }, [])
    const groupRef = useRef<THREE.Group>()
    const innerGroup = useRef<THREE.Group>()
    const rootRef = useRef<THREE.Group>()
    //const boxHelperRef = useRef(new THREE.BoxHelper(groupRef.current, 0xffff00))

    useFrame(state => {
        if (groupRef.current) {
            // const boundingBox = new THREE.Box3().setFromObject(groupRef?.current)
            // boundingBox.setFromObject(rootRef.current)
            // boxHelperRef.current.update()

            if (srX || srY || srZ) {
                const currentQuaternion = groupRef.current.quaternion.clone()
                const xQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), srX)
                const yQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), srY)
                const zQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), srZ)

                currentQuaternion.multiply(xQuaternion)
                currentQuaternion.multiply(yQuaternion)
                currentQuaternion.multiply(zQuaternion)
                groupRef.current.quaternion.copy(currentQuaternion)
            }
            if (speed) {
                const moveVector = new THREE.Vector3(0, 0, -speed)
                moveVector.applyQuaternion(groupRef.current.quaternion)
                groupRef.current.position.add(moveVector)
            }
        }
    })

    return (
        <group ref={rootRef} position={[0, 0, 0]}>
            <group ref={groupRef}>
                <group>
                    <PerspectiveCamera makeDefault position={[0, 0, 20]} />
                </group>
                <group
                    ref={innerGroup}
                    rotation={[srX * INNER_ROTATION_RAD, srY * INNER_ROTATION_RAD, srZ * INNER_ROTATION_RAD]}
                >
                    <Model scale={0.5} position={[0, 0, 0]} rotation={[initialR.rX, initialR.rY, initialR.rZ]} />
                </group>
            </group>
        </group>
    )
}

export default Jet2
