import React, { useCallback, useEffect, useState } from 'react'
import { GameDataMessage } from '@desktop-app/GameEngine/Classes/GameEngine'
import Keyboard from '@desktop-app/GameEngine/Camera/DebugUi/Keyboard'

const labelStyle = { userSelect: 'none', color: 'white' }
const mutateAxis = (mutation: number) => (x: number) => (x < 180 && x > -180 ? x + mutation : x)

const useTicks = () => {
    const [tick, setTick] = useState(0)
    useEffect(() => {
        let time
        const frame = time =>
            requestAnimationFrame(() => {
                setTick(time)
                time = requestAnimationFrame(frame)
            })
        requestAnimationFrame(frame)
        return cancelAnimationFrame(time)
    }, [])
    return tick
}
const DebugUI: React.FC<{ onMessage: (message: GameDataMessage) => void }> = ({ onMessage }) => {
    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)
    const [move, setMove] = useState(false)
    const [trace, setTrace] = useState(0)
    const [hidden, setHidden] = useState(false)
    const tick = useTicks()

    useEffect(() => {
        const kb = new Keyboard()
        kb.keyDown.set('Space', () => setMove(true))
        kb.keyUp.set('Space', () => setMove(false))
        kb.keyDown.set('KeyA', () => setZ(mutateAxis(-1)))
        kb.keyDown.set('KeyD', () => setZ(mutateAxis(1)))
        kb.keyDown.set('KeyW', () => setY(mutateAxis(1)))
        kb.keyDown.set('KeyS', () => setY(mutateAxis(-1)))
        kb.keyDown.set('KeyR', () => setHidden(x => !x))
        kb.init()
        return () => kb.destroy()
    }, [])

    const sendMessage = useCallback(() => {
        onMessage({ rotateX: parseInt(x, 10), rotateY: parseInt(y, 10), rotateZ: -parseInt(z, 10), move })
        move && setTrace(x => x + 1)
    }, [x, y, z, move])

    useEffect(sendMessage, [tick])

    return (
        <div style={{ visibility: hidden ? 'hidden' : 'initial', position: 'absolute', display: 'flex', zIndex: 2 }}>
            <button onMouseUp={() => setMove(false)} onMouseDown={() => setMove(true)}>
                MOVE
            </button>
            <label style={labelStyle}>
                <input
                    onDoubleClick={() => setX(0)}
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={x}
                    onChange={e => setX(e.target.value)}
                    tabIndex="1"
                />
                <div>rX [{x}]</div>
            </label>
            <label style={labelStyle}>
                <input
                    onDoubleClick={() => setY(0)}
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={y}
                    onChange={e => setY(e.target.value)}
                    tabIndex="2"
                />
                <div>rY[{y}]</div>
            </label>
            <label style={labelStyle}>
                <input
                    onDoubleClick={() => setZ(0)}
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={z}
                    onChange={e => setZ(e.target.value)}
                    tabIndex="3"
                />
                <div>rZ[{z}]</div>
            </label>
            <label style={labelStyle}>Trace: {trace}</label>
        </div>
    )
}

export default DebugUI
