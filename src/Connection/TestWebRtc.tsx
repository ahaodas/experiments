import React, { useEffect, useRef, useState } from 'react'
import { StoredConnection, useConnectionsStore } from 'utils/connection/connection.store'
import { Link } from 'react-router-dom'
import Chat from './ChatWindow'
import ChatWindow from './ChatWindow'
import { MessageType, useSessionDataStore } from 'utils/session/session.store'

const CreateRoomButton: React.FC = () => {
    const [loading, setLoading] = useState(false)
    const addRoom = useConnectionsStore(({ addRoom }) => addRoom)
    const createRoom = async (withConnection?: boolean) => {
        setLoading(true)
        await addRoom(withConnection)
        setLoading(false)
    }
    return (
        <div>
            <button disabled={loading} onClick={() => createRoom()}>
                New room
            </button>
            <button disabled={loading} onClick={() => createRoom(true)}>
                New connected room
            </button>
            {loading && <i>Creating room...</i>}
        </div>
    )
}

const DeleteRoomButton: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [loading, setLoading] = useState(false)
    const removeConnection = useConnectionsStore(({ removeConnection }) => removeConnection)

    const deleteRoom = async () => {
        setLoading(true)
        await removeConnection(roomId)
        setLoading(false)
    }
    return (
        <>
            <button disabled={loading} onClick={deleteRoom}>
                Remove Room
            </button>
            {loading && <i>Removing room...</i>}
        </>
    )
}

export const EnableRoomButton: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [loading, setLoading] = useState(false)
    const initConnectionForRoom = useConnectionsStore(({ initConnectionForRoom }) => initConnectionForRoom)

    const deleteRoom = async () => {
        setLoading(true)
        await initConnectionForRoom(roomId)
        setLoading(false)
    }
    return (
        <>
            <button disabled={loading} onClick={deleteRoom}>
                Open
            </button>
            {loading && <i>Opening...</i>}
        </>
    )
}

export const DisableRoomButton: React.FC<{ roomId: string }> = ({ roomId }) => {
    const [loading, setLoading] = useState(false)
    const disableConnection = useConnectionsStore(({ disableConnection }) => disableConnection)

    const deleteRoom = async () => {
        setLoading(true)
        await disableConnection(roomId)
        setLoading(false)
    }
    return (
        <>
            <button disabled={loading} onClick={deleteRoom}>
                Close
            </button>
            {loading && <i>Closing...</i>}
        </>
    )
}

const StatsBlock: React.FC<{ connection: RTCPeerConnection }> = ({ connection }) => {
    const [stats, setStats] = useState([])
    useEffect(() => {
        const interval = setInterval(async () => {
            const stats = await connection.getStats()
            console.log(stats.entries())
            let res = ''
            stats.forEach(report => {
                res += Object.entries(report).map(([key, value]) => {
                    ;`| ${key}: ${value} |`
                })
            })
            setStats(x => [...x, res])
        }, 1000)
        return () => clearInterval(interval)
    }, [])
    return (
        <div style={{ height: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {stats.map((stat, i) => (
                <code key={i} style={{ fontSize: 12 }}>
                    {stat}
                </code>
            ))}
        </div>
    )
}

export const ChannelView: React.FC<{ connection: StoredConnection; roomId?: string }> = ({ connection, roomId }) => {
    const setDataChannelSubscriptions = useConnectionsStore(({ setDataChannelSubscriptions }) => setDataChannelSubscriptions)
    const disableConnection = useConnectionsStore(({ disableConnection }) => disableConnection)
    const [error, setError] = useState()
    const [channel, setChannel] = useState<RTCDataChannel>()
    const [needReconnect, setNeedReconnect] = useState(false)
    const [inpVal, setInpVal] = useState('')
    const { currentSession, processMessage, createSession, pushSessionMessage } = useSessionDataStore()
    useEffect(() => {
        if (connection.dataChannel)
            connection.dataChannel.onmessage = ({ data }) => {
                const message = JSON.parse(data)
                processMessage(message)
            }
        if (Boolean(connection.unsubscribe)) {
            setDataChannelSubscriptions(connection.connection, channel => {
                return {
                    onopen: () => {
                        setChannel(channel)
                        if (currentSession) {
                            channel.send(JSON.stringify({ type: MessageType.session, data: currentSession }))
                        } else {
                            createSession({ user: 'User' + Math.random().toString().slice(3, 10) })
                        }
                    },
                    onclose: () => {
                        setChannel(undefined)
                        if (roomId) disableConnection(roomId)
                        setNeedReconnect(true)
                    },
                    onerror: e => console.log('ERROR', e),
                }
            })
        }
    }, [Boolean(connection.unsubscribe)])

    const sendData = async () => {
        await channel.send(
            JSON.stringify({
                type: MessageType.text,
                data: { user: currentSession?.meta.user, text: inpVal },
            })
        )
        pushSessionMessage({ user: currentSession?.meta.user, text: inpVal })
        setInpVal('')
    }

    return (
        <div>
            {needReconnect && <button onClick={() => window.location.reload()}>Reconnect</button>}
            <h4>{currentSession?.meta.user}</h4>
            <div style={{ display: 'flex' }}>
                <div>
                    {error && <b style={{ color: 'tomato' }}>error :(</b>}
                    {currentSession && (
                        <ChatWindow user={currentSession.meta.user} messages={currentSession?.sessionMessages} />
                    )}
                    <div style={{ display: 'flex' }}>
                        <span>{Boolean(channel) ? '🟢' : '⚫️'}</span>
                        <label>
                            <input
                                style={{ color: 'black' }}
                                value={inpVal}
                                onChange={e => setInpVal(e.target.value)}
                                type="text"
                            />
                        </label>
                        <button onClick={sendData}>send</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ParentRoomItem: React.FC<{ roomId: string }> = ({ roomId }) => {
    const connection = useConnectionsStore(({ connections }) => connections[roomId])
    const disableRoom = useConnectionsStore(({ disableConnection }) => disableConnection)
    useEffect(() => () => disableRoom(roomId), [])
    return <RoomItem connection={connection} roomId={roomId} />
}

const RoomItem: React.FC<{ connection?: StoredConnection; roomId?: string }> = ({ roomId, connection }) => {
    return (
        <div>
            <div style={{ display: 'flex', gap: 50 }}>
                <div>
                    <Link
                        style={{
                            color: connection.unsubscribe ? 'cyan' : 'inherit',
                        }}
                        target="_blank"
                        to={`/joinRoom/${roomId}`}
                    >
                        {roomId}
                    </Link>{' '}
                    <div>
                        {connection.unsubscribe ? <DisableRoomButton roomId={roomId} /> : <EnableRoomButton roomId={roomId} />}
                    </div>
                    <div>
                        <DeleteRoomButton roomId={roomId} />
                    </div>
                    <ChannelView connection={connection} roomId={roomId} />
                </div>
                {/*{connection.connection && <StatsBlock connection={connection.connection} />}*/}
            </div>
        </div>
    )
}
const RoomsList: React.FC = () => {
    const roomIds = useConnectionsStore(({ connections }) => Object.keys(connections))
    const loadRooms = useConnectionsStore(({ loadRooms }) => loadRooms)
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        setLoading(true)
        loadRooms().then(() => setLoading(false))
    }, [])
    if (loading) return <i>...Loading rooms</i>
    if (!roomIds.length) return <i>No rooms</i>
    return (
        <div>
            {roomIds.map(roomId => (
                <ParentRoomItem key={roomId} roomId={roomId} />
            ))}
        </div>
    )
}

const TestWebRtc: React.FC = () => {
    return (
        <div>
            TestWebRtc
            <div>
                <CreateRoomButton />
            </div>
            <div>
                <RoomsList />
            </div>
        </div>
    )
}

export default TestWebRtc
