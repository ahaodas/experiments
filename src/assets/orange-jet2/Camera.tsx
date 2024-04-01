import React, { useRef, useState } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Camera = ({ objectPosition, objectRotation }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>()
    const [previousPsi, setPreviousPsi] = useState(objectRotation[2])

    useFrame(() => {
        // Переводим углы в радианы
        const theta = objectRotation[0]
        const phi = objectRotation[1]
        const psi = objectRotation[2]

        // Длина палки
        const OFFSET = 10

        // Применяем обратное преобразование поворота объекта к камере
        const inverseTheta = -theta
        const inversePhi = -phi
        const inversePsi = -psi

        // Вычисляем сферические координаты камеры
        const radius = OFFSET
        let polar = inverseTheta // Угол между осью z и палкой
        let azimuthal = inversePsi // Угол между осью x и проекцией палки на плоскость xy

        // Проверяем, сделала ли камера полный оборот по оси
        if (psi - previousPsi > Math.PI) {
            // Обнуляем значение, если камера сделала полный оборот
            azimuthal = inversePsi
            setPreviousPsi(psi)
        }

        // Преобразуем сферические координаты в декартовы
        const x = objectPosition[0] + radius * Math.sin(polar) * Math.cos(azimuthal)
        const y = objectPosition[1] + radius * Math.sin(polar) * Math.sin(azimuthal)
        const z = objectPosition[2] + radius * Math.cos(polar)

        if (cameraRef.current) {
            console.log('cameraRef.current')
            // Устанавливаем новые координаты камеры
            cameraRef.current.position.set(x, y, z)

            // Используем phi для определения высоты камеры относительно объекта
            const height = radius * Math.sin(inversePhi)
            cameraRef.current.position.y += height

            cameraRef.current.lookAt(objectPosition[0], objectPosition[1], objectPosition[2])
        }
    })

    return <PerspectiveCamera makeDefault ref={cameraRef} />
}
