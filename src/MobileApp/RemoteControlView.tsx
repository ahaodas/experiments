import React, { useRef, useContext, useEffect, useState } from 'react'
import styles from './RemoteControlView.module.less'
import cn from 'classnames'
import Toggle from '@mobile-app/Components/Toggle'
import { useParams } from 'react-router'
import ConnectionContext from 'utils/connection/ConnectionContext'

const filterRotation = deg => (deg > 180 ? deg - 360 : deg)
const checkPermission = async () => {
    // @ts-ignores
    if (!DeviceOrientationEvent?.requestPermission) {
        return true
    } else {
        // @ts-ignores
        return (await DeviceOrientationEvent.requestPermission()) === 'granted'
    }
}

const RemoteControlView = () => {
    const connectionService = useContext(ConnectionContext)
    const [connected, setConnected] = useState(false)
    const [channel, setChannel] = useState(null)
    const [active, setActive] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const [move, setMove] = useState(false)
    const { raceId } = useParams()

    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)

    const dataRef = useRef(null)
    const activeRef = useRef(false)

    useEffect(() => {
        // dataRef.current = { rotateX: x, rotateY: y, rotateZ: z, move }
        // activeRef.current = active
        channel && channel.send(JSON.stringify({ rotateX: x, rotateY: y, rotateZ: z, move }))
    }, [x, y, z, move, active, Boolean(channel)])

    // const sendingLoop = channel => {
    //     dataRef.current && activeRef.current === true && channel.send(JSON.stringify(dataRef.current))
    //     setTimeout(() => sendingLoop(channel))
    // }

    const handleOrientation = e => {
        setX(filterRotation(Math.round(e.beta)))
        setY(Math.round(e.gamma))
        setZ(filterRotation(Math.round(e.alpha)))
    }

    useEffect(() => {
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation)
            //   connectionService.signalServer.removeRoom().catch(console.log)
        }
    }, [])

    useEffect(() => {
        if (active) {
            checkPermission().then(() => {
                window.addEventListener('deviceorientation', handleOrientation)
            })
        }
    }, [active])

    useEffect(() => {
        raceId &&
            connectionService
                .joinRoom(raceId)
                .catch(console.log)
                .then(() => {
                    setGameOver(false)
                    connectionService.setDataChannelSubscriptions(channel => ({
                        onopen: () => {
                            // sendingLoop(channel)
                            setConnected(true)
                            setChannel(channel)
                        },
                        onclose: () => setGameOver(true),
                    }))
                })
    }, [Boolean(raceId)])

    return (
        <div
            onTouchStart={() => setMove(true)}
            onTouchEnd={() => setMove(false)}
            className={cn(styles.root, { [styles.move]: move, [styles.active]: active })}
        >
            <div>
                {gameOver ? (
                    <div className={styles.loader}>lost connection</div>
                ) : connected ? (
                    <Toggle id="main toggle" onChange={setActive} value={active} />
                ) : (
                    <div className={styles.loader}>Connecting...</div>
                )}
            </div>
        </div>
    )
}
export default RemoteControlView
