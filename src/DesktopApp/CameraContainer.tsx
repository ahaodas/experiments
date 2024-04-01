import * as THREE from 'three'
import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'

const INNER_ROTATION_RAD = (Math.PI / 12) * 100

interface Props extends React.PropsWithChildren {
    srX: number
    srY: number
    srZ: number
    moveSpeed: number
}

const CameraContainer: React.FC<Props> = ({ children, srX, srY, srZ, moveSpeed }) => {
    const groupRef = useRef<THREE.Group>()
    const innerGroup = useRef<THREE.Group>()
    const rootRef = useRef<THREE.Group>()

    useEffect(() => {
        if ((srX || srY || srZ) && groupRef.current) {
            const currentQuaternion = groupRef.current.quaternion.clone()
            const xQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), srX)
            const yQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), srY)
            const zQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), srZ)

            currentQuaternion.multiply(xQuaternion)
            currentQuaternion.multiply(yQuaternion)
            currentQuaternion.multiply(zQuaternion)
            groupRef.current.quaternion.copy(currentQuaternion)
        }
    }, [srX, srY, srZ, Boolean(groupRef.current)])

    useFrame(() => {
        if (groupRef.current) {
            // if (srX || srY || srZ) {
            //     const currentQuaternion = groupRef.current.quaternion.clone()
            //     const xQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), srX)
            //     const yQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), srY)
            //     const zQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), srZ)
            //
            //     currentQuaternion.multiply(xQuaternion)
            //     currentQuaternion.multiply(yQuaternion)
            //     currentQuaternion.multiply(zQuaternion)
            //     groupRef.current.quaternion.copy(currentQuaternion)
            // }
            if (moveSpeed) {
                const moveVector = new THREE.Vector3(0, 0, -moveSpeed)
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
                    {children}
                </group>
            </group>
        </group>
    )
}

export default CameraContainer
