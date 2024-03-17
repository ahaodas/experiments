import React, { useEffect, useState } from 'react'
import { StoredConnection, useConnectionsStore } from 'utils/connection/connection.store'
import { useParams } from 'react-router'
import { ChannelView, DisableRoomButton, EnableRoomButton } from './TestWebRtc'

const ParentRoomItem: React.FC<{ roomId: string }> = ({ roomId }) => {
    const connection = useConnectionsStore(({ connections }) => connections[roomId])
    const connectToRoom = useConnectionsStore(({ connectToRoom }) => connectToRoom)
    const disableRoom = useConnectionsStore(({ disableConnection }) => disableConnection)
    useEffect(() => () => disableRoom(roomId), [])
    const connect = async () => {
        if (connection.unsubscribe) {
            await connectToRoom(roomId)
        }
    }
    return <RoomItem connection={connection} onClick={connect} roomId={roomId} />
}

const RoomItem: React.FC<{ connection?: StoredConnection; onClick?: () => void; roomId?: string }> = ({
    roomId,
    onClick,
    connection,
}) => {
    return (
        <div>
            <div style={{ display: 'flex', gap: 50 }}>
                <div>
                    <div
                        style={{
                            cursor: Boolean(onClick) ? 'pointer' : 'default',
                            color: connection.unsubscribe ? 'cyan' : 'inherit',
                        }}
                        onClick={onClick}
                    >
                        {roomId}
                    </div>{' '}
                    {connection.unsubscribe ? <DisableRoomButton roomId={roomId} /> : <EnableRoomButton roomId={roomId} />}
                    <ChannelView connection={connection} roomId={roomId} />
                </div>
            </div>
        </div>
    )
}

const RoomsList: React.FC = () => {
    const roomIds = useConnectionsStore(({ connections }) => Object.keys(connections))
    return (
        <div>
            {roomIds.map(roomId => (
                <ParentRoomItem key={roomId} roomId={roomId} />
            ))}
        </div>
    )
}

const TestJoinRoom: React.FC = () => {
    const { roomId } = useParams()
    const [loading, setLoading] = useState(false)
    const connectToRoom = useConnectionsStore(({ connectToRoom }) => connectToRoom)
    useEffect(() => {
        setLoading(true)
        connectToRoom(roomId).then(() => setLoading(false))
    }, [roomId])

    if (loading) {
        return <>...Connecting</>
    }

    return (
        <div>
            <RoomsList />
        </div>
    )
}

export default TestJoinRoom
