import React, { useMemo, useEffect, useRef } from 'react'
import styles from './StaticBox.module.less'
import cn from 'classnames'
import { MoveShapeProps } from '@desktop-app/GameEngine/Classes/MoveShape'

enum SideName {
    back = 'back',
    front = 'front',
    left = 'left',
    top = 'top',
    bottom = 'bottom',
    right = 'right',
}
const getStyle = (sideName: SideName, length: number, value = `${length}px`) => {
    const style: Partial<CSSStyleDeclaration> = {}
    switch (sideName) {
        case SideName.top:
        case SideName.bottom:
            style.height = value
            break
        case SideName.right:
        case SideName.left:
            style.width = value
            break
        case SideName.back:
            style.transform = `translateZ(-${value})`
    }
    return style
}

interface Sides {
    renderSides?: SideName[]
}

const SIDES = [SideName.back, SideName.front, SideName.left, SideName.top, SideName.bottom, SideName.right]
const StaticBox: React.FC<MoveShapeProps & Sides> = ({
    renderSides = SIDES,
    altColor = 'cyan',
    color = 'tomato',
    staticCords,
    height,
    length,
    width,
    x,
    y,
    z,
}) => {
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!ref.current) return
        ref.current.style.setProperty('--x', `${x}px`)
        ref.current.style.setProperty('--y', `${y}px`)
        ref.current.style.setProperty('--z', `${z}px`)
    }, [x, y, z, Boolean(ref.current)])
    useEffect(() => {
        if (!ref.current) return
        ref.current.style.setProperty('--color', color)
        ref.current.style.setProperty('--alt-color', altColor)
    }, [color, Boolean(ref.current)])
    const sides = useMemo(
        () =>
            renderSides.map(sideName => {
                return (
                    <div key={sideName} style={getStyle(sideName, length)} className={cn(styles.side, styles[sideName])}>
                        {sideName}
                    </div>
                )
            }),
        [length, renderSides]
    )
    return (
        <div ref={ref} style={{ height, width, ...staticCords }} className={styles.root}>
            {sides}
        </div>
    )
}

export default StaticBox
