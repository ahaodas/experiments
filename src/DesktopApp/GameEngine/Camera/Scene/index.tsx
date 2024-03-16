import React, { useRef, useEffect } from 'react'
import styles from './Scene.module.less'
import StaticBox from '@desktop-app/GameEngine/Shapes/StaticBox'
import { MoveShapeProps, MoveShapeType } from '@desktop-app/GameEngine/Classes/MoveShape'
import Scene from '@desktop-app/GameEngine/Classes/Scene'
import { setOrientation } from '@desktop-app/GameEngine/utils'

const MoveShape: React.FC<MoveShapeProps> = props => {
    switch (props.type) {
        case MoveShapeType.box:
            return <StaticBox {...props} />
        default:
            return null
    }
}
const SceneWrapper: React.FC<{ scene: Scene }> = ({ scene }) => {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!ref.current) return
        const { rotateZ, rotateY, rotateX } = scene.containerShape
        ref.current.style.setProperty('--x', `${rotateX}deg`)
        ref.current.style.setProperty('--y', `${rotateY}deg`)
        ref.current.style.setProperty('--z', `${rotateZ}deg`)
    }, [Boolean(ref.current), scene.containerShape.rotateZ, scene.containerShape.rotateY, scene.containerShape.rotateX])
    return (
        <div ref={ref} className={styles.root}>
            {/*{scene.aim && <MoveShape {...scene.aim} />}*/}
            {scene.children.map((x, i) => (
                <MoveShape key={i} {...x} />
            ))}
        </div>
    )
}

export default SceneWrapper
