import React, { useCallback, useContext, useEffect, useState } from 'react'
import styles from './RemoteControlView.module.less'
import cn from 'classnames'
import Toggle from '@mobile-app/Components/Toggle'
import { useParams } from 'react-router'
import ConnectionContext from 'utils/connection/ConnectionContext'

const filterRotation = deg => (deg > 180 ? deg - 360 : deg)
const isAndroid = /(android)/i.test(navigator.userAgent);
const checkPermission = async () =>
    // @ts-ignore
    !DeviceOrientationEvent?.requestPermission ||
    // @ts-ignore
    (await DeviceOrientationEvent.requestPermission()) === 'granted'
const RemoteControlView = () => {
    const connectionService = useContext(ConnectionContext)
    const [connected, setConnected] = useState(false)
    const [channel, setChannel] = useState(null)
    const [active, setActive] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    const { raceId } = useParams()
    useEffect(() => {
        raceId &&
            connectionService
                .joinRoom(raceId)
                .catch(console.log)
                .then(() => {
                    setGameOver(false)
                    connectionService.setDataChannelSubscriptions(channel => ({
                        onopen: () => {
                            setConnected(true)
                            setChannel(channel)
                        },
                        onclose: () => setGameOver(true),
                    }))
                })
    }, [Boolean(raceId)])

    useEffect(
        () => () => {
            window.removeEventListener('deviceorientation', handleMove)
            connectionService.clearStore().catch(console.log)
        },
        []
    )

    const handleMove = useCallback(
        e =>
            channel &&
            channel.send(
                JSON.stringify({
                    z: filterRotation(Math.round(e.alpha)),
                    x: filterRotation(Math.round(e.beta)),
                    y: Math.round(e.gamma),
                })
            ),
        [Boolean(channel)]
    )

    useEffect(() => {
        if (active) {
            isAndroid ?
            checkPermission().then(() => window.addEventListener('deviceorientation', handleMove))
            : window.addEventListener('deviceorientation', handleMove)
        } else {
            window.removeEventListener('deviceorientation', handleMove)
        }
    }, [active])

    return (
        <div className={cn(styles.root, { [styles.active]: active })}>
            {gameOver ? (
                <div className={styles.loader}>lost connection</div>
            ) : connected ? (
                <Toggle id="main toggle" onChange={setActive} value={active} />
            ) : (
                <div className={styles.loader}>Connecting...</div>
            )}
        </div>
    )
}
export default RemoteControlView
