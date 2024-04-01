import { useJetStore } from './raceViewPort.store'
import { useEffect } from 'react'
import Keyboard from '@desktop-app/GameEngine/Camera/DebugUi/Keyboard'
import { MOVE_SPEED, ROTATION_SPEED } from './gameConstants'

export const useRaceKeyBoard = () => {
    const { setMoveSpeed, setRotationSpeed } = useJetStore()
    useEffect(() => {
        const kb = new Keyboard()
        kb.keyDown.set('Space', () => setMoveSpeed(MOVE_SPEED))
        kb.shitKeyDown.set('Space', () => setMoveSpeed(-MOVE_SPEED))
        kb.keyUp.set('Space', () => setMoveSpeed(0))

        kb.keyDown.set('KeyW', () => setRotationSpeed({ srX: -ROTATION_SPEED }))
        kb.keyUp.set('KeyW', () => setRotationSpeed({ srX: 0 }))

        kb.keyDown.set('KeyS', () => setRotationSpeed({ srX: ROTATION_SPEED }))
        kb.keyUp.set('KeyS', () => setRotationSpeed({ srX: 0 }))

        kb.keyDown.set('KeyQ', () => setRotationSpeed({ srY: ROTATION_SPEED }))
        kb.keyUp.set('KeyQ', () => setRotationSpeed({ srY: 0 }))

        kb.keyDown.set('KeyE', () => setRotationSpeed({ srY: -ROTATION_SPEED }))
        kb.keyUp.set('KeyE', () => setRotationSpeed({ srY: 0 }))

        kb.keyDown.set('KeyA', () => setRotationSpeed({ srZ: ROTATION_SPEED }))
        kb.keyUp.set('KeyA', () => setRotationSpeed({ srZ: 0 }))

        kb.keyDown.set('KeyD', () => setRotationSpeed({ srZ: -ROTATION_SPEED }))
        kb.keyUp.set('KeyD', () => setRotationSpeed({ srZ: 0 }))

        kb.init()
        return () => kb.destroy()
    }, [])
}
