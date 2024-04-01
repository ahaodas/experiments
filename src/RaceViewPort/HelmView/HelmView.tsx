import React, { useCallback, useEffect, useRef, useState } from 'react'
import InnerLayout from 'components/InnerLayout'
import { useParams } from 'react-router'
import { useConnectionsStore } from 'utils/connection/connection.store'
import { useDataChannelStore } from 'utils/connection/dataChannel.store'
import { MessageType } from 'utils/session/session.store'
import { MOVE_SPEED, ROTATION_SPEED } from '../gameConstants'
import { parseInput } from 'prettier-plugin-glsl/lib'
import Toggle from '@mobile-app/Components/Toggle'

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

const toRad = (deg: number) => deg * (Math.PI / 180)

export const HelmView = () => {
    const [active, setActive] = useState(false)
    const [locked, setLocked] = useState(true)
    const { roomId } = useParams()
    const [loading, setLoading] = useState(false)
    const connectToRoom = useConnectionsStore(({ connectToRoom }) => connectToRoom)
    const { bindChannels, outChannel, inputChannel } = useDataChannelStore()
    const { selectedConnection } = useConnectionsStore()
    const [senceA, setSenceA] = useState(0.1)
    const [senceB, setSenceB] = useState(0.1)
    const [senceG, setSenceG] = useState(0.1)
    useEffect(() => {
        console.log({ selectedConnection })
        const output = selectedConnection?.responseDataChannel
        const input = selectedConnection?.dataChannel
        if (input && output && !outChannel && !inputChannel) {
            bindChannels(input, output)
        }
    }, [Boolean(outChannel) && Boolean(inputChannel), selectedConnection])

    useEffect(() => {
        if (roomId) {
            setLoading(true)
            connectToRoom(roomId).then(() => setLoading(false))
        }
    }, [roomId])

    const [x, setX] = useState(0)
    const [y, setY] = useState(0)
    const [z, setZ] = useState(0)

    const getData = useCallback(() => {
        return {
            srX: toRad(x) * senceA,
            srY: toRad(y) * senceB * 0.3,
            srZ: toRad(z) * senceG,
            moveSpeed: active ? MOVE_SPEED : 0,
        }
    }, [senceG, senceB, senceA, x, y, z, active])

    useEffect(() => {
        outChannel && !locked && outChannel.send(JSON.stringify(getData()))
    }, [x, y, z, active, Boolean(outChannel), locked])

    const handleOrientation = e => {
        setX(filterRotation(Math.round(e.beta)))
        setY(filterRotation(Math.round(e.alpha)))
        setZ(filterRotation(Math.round(-e.gamma)))
    }

    useEffect(() => {
        checkPermission().then(() => {
            window.addEventListener('deviceorientation', handleOrientation)
        })
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation)
        }
    }, [])

    if (loading) {
        return <>...Connecting</>
    }

    return (
        <InnerLayout>
            <div>
                <div>
                    <input
                        onChange={e => setSenceA(parseFloat(e.target.value))}
                        value={senceA}
                        type="range"
                        step={0.01}
                        min={0.009}
                        max={0.5}
                    />
                </div>
                <label>Sense alpha: {senceA}</label>
            </div>
            <div>
                <div>
                    <input
                        onChange={e => setSenceB(parseFloat(e.target.value))}
                        value={senceB}
                        type="range"
                        step={0.01}
                        min={0.009}
                        max={0.5}
                    />
                </div>
                <label>Sense beta: {senceB} </label>
            </div>
            <div>
                <div>
                    <input
                        onChange={e => setSenceG(parseFloat(e.target.value))}
                        value={senceG}
                        type="range"
                        step={0.01}
                        min={0.009}
                        max={0.5}
                    />
                </div>
                <label>Sense gamma: {senceG}</label>
            </div>
            <div
                onClick={() => {
                    checkPermission().then(() => {
                        window.addEventListener('deviceorientation', handleOrientation)
                    })
                }}
                draggable={false}
                onTouchEnd={() => setActive(false)}
                onTouchStart={() => setActive(true)}
                style={{ width: '100%', flexGrow: 99, background: active ? 'magenta' : 'none' }}
            >
                {outChannel ? 'hasChannel' : 'noChannel'}
                {outChannel && <Toggle id="main toggle" onChange={setLocked} value={locked} />}
            </div>
        </InnerLayout>
    )
}
