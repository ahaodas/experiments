import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useConnectionsStore } from 'utils/connection/connection.store'
import QRCode from 'react-qr-code'
import { Link } from 'react-router-dom'
import { useDataChannelStore } from 'utils/connection/dataChannel.store'
import { MessageType, useSessionDataStore } from 'utils/session/session.store'
import { RaceViewPort } from '../RaceViewPort/RaceViewPort'

export const ConnectionStatus = () => {
    const { roomId } = useParams()
    const currentConnection = useConnectionsStore(({ connections }) => connections[roomId])
    const { outChannel, inputChannel } = useDataChannelStore()
    return (
        <>
            <div>connection status: {currentConnection?.connection?.connectionState} </div>
            <div>outChannel status: {outChannel?.readyState} </div>
            <div>inputChannel status: {inputChannel?.readyState}</div>
        </>
    )
}
export const WaitingView = () => {
    const { roomId } = useParams()
    const { bindChannels, outChannel, inputChannel } = useDataChannelStore()
    const { connections } = useConnectionsStore()
    useEffect(() => {
        if (roomId) {
            const output = connections[roomId]?.responseDataChannel
            const input = connections[roomId]?.dataChannel
            if (input && output && !outChannel && !inputChannel) {
                bindChannels(input, output)
            }
        }
    }, [roomId, Boolean(outChannel) && Boolean(inputChannel), connections])

    if (outChannel?.readyState === 'open' && inputChannel?.readyState === 'open') {
        return <RaceViewPort />
    }

    return (
        <Link target="_blank" to={`/helm/${roomId}`}>
            <QRCode fgColor="cyan" bgColor="transparent" value={`${location.origin}${location.pathname}#/helm/${roomId}`} />
        </Link>
    )
}

export const ExistingRoom = () => {
    const { roomId } = useParams()
    const { loadRooms, connections, initConnectionForRoom } = useConnectionsStore()
    useEffect(() => {
        roomId && loadRooms().then(() => initConnectionForRoom(roomId))
    }, [roomId])

    if (connections[roomId]?.connection) {
        return <WaitingView />
    }
    return <>Connecting room {roomId}</>
}
export const TestCreateRoom = () => {
    const { addRoom } = useConnectionsStore()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const createRoom = () => {
        setLoading(true)
        addRoom(true, true).then(connection => {
            console.log('connection.roomId', connection.roomId)
            setLoading(false)
            navigate(`${connection.roomId}`)
        })
    }

    return (
        <button disabled={loading} onClick={createRoom}>
            Create room
        </button>
    )
}

const Receiver: React.FC = () => {
    const { processMessage, currentSession, createSession } = useSessionDataStore()
    const { inputChannel, outChannel } = useDataChannelStore()
    useEffect(() => {
        createSession({ user: 'receiver' })
        outChannel.send(JSON.stringify({ type: MessageType.text, data: { user: 'receiver', text: 'receiver opened' } }))
        inputChannel.onmessage = e => {
            console.log('inputChannel.onmessage', e)
            const data = JSON.parse(e.data)
            processMessage(data)
        }
    }, [])

    const ping = useCallback(
        () =>
            outChannel.send(
                JSON.stringify({
                    type: MessageType.text,
                    data: { user: 'receiver', text: 'Ping' },
                })
            ),
        [Boolean(outChannel)]
    )

    useEffect(() => {
        currentSession && console.log('sessionMessages:', currentSession?.sessionMessages)
    }, [currentSession])

    if (!currentSession?.sessionMessages) {
        return <>Creating session...</>
    }

    return (
        <div>
            <button onClick={ping}>ping</button>
            <div>Messages:</div>
            {currentSession?.sessionMessages?.map(x => (
                <div>
                    {x.user}: {x.text}
                </div>
            ))}
        </div>
    )
}
