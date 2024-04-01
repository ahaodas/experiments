import { create } from 'zustand'
import firebase from 'firebase/compat'
import Firestore = firebase.firestore.Firestore
import { produce } from 'immer'
import config from 'utils/webRTCconfig'
import { offerIsValid, setSubscriptionsOnRegister } from 'utils/connection/utils/setSubscriptionsOnRegister'
import { deleteDoc, doc, getDocs } from 'firebase/firestore'

enum ConnectionStatus {
    new = 'new',
    connecting = 'connecting',
    connected = 'connected',
    disconnected = 'disconnected',
    closed = 'closed',
    failed = 'failed',
    none = 'none',
}

export interface StoredConnection {
    status: ConnectionStatus
    connection?: RTCPeerConnection
    unsubscribe?: () => void
    dataChannel: RTCDataChannel
    responseDataChannel?: RTCDataChannel
    childConnections?: StoredConnection[]
    roomId: string
}

interface ConnectionStore {
    db: Firestore
    selectedConnection?: StoredConnection
    selectConnection: (roomId: string) => void
    connections: Record<string, StoredConnection>
    addRoom: (withConnection?: boolean, makeSelected?: boolean) => Promise<StoredConnection>
    loadRooms: () => Promise<void>
    removeConnection: (roomId: string) => Promise<void>
    disableConnection: (roomId: string) => void
    initConnectionForRoom: (
        roomId: string,
        existingRoom?: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>
    ) => Promise<void>
    setDataChannelSubscriptions: (
        connection: RTCPeerConnection,
        getHandlers: (channel?: RTCDataChannel) => DataChannelHandlers,
        roomId?: string
    ) => () => void
    connectToRoom: (roomId: string) => Promise<void>
    log: (title: string, ...args: any[]) => void
}

const getDB = () => {
    console.log('getDB')
    return firebase.firestore()
}

export const useConnectionsStore = create<ConnectionStore>((set, get) => ({
    connections: {},
    db: getDB(),
    loadRooms: async () => {
        const docs = await getDocs(get().db.collection('rooms'))
        docs.forEach(({ id }) => {
            set(
                produce(state => {
                    state.connections[id] = {}
                })
            )
        })
    },

    addRoom: async (withConnection, makeSelected) => {
        const rooms = get().db.collection('rooms')
        const room = await rooms.add({})
        set(
            produce(state => {
                state.connections[room.id] = { roomId: room.id }
                if (makeSelected) {
                    state.selectedConnection = state.connections[room.id]
                }
            })
        )

        if (withConnection) {
            await get().initConnectionForRoom(room.id, room)
        }
        return get().connections[room.id]
    },
    disableConnection: async roomId => {
        const connection = get().connections[roomId]
        if (!connection) return
        if (connection.unsubscribe) connection.unsubscribe()
        connection.dataChannel?.close()
        await get().db.collection('rooms').doc(roomId).set({})
        set(
            produce(state => {
                state.connections[roomId] = {}
            })
        )
    },

    initConnectionForRoom: async (roomId, existingRoom) => {
        const connection = new RTCPeerConnection(config)
        connection.onconnectionstatechange = () =>
            set(
                produce(state => {
                    state.connections[roomId].status = connection.connectionState
                })
            )
        const dataChannel = connection.createDataChannel('DataChannel')
        const room = existingRoom || get().db.collection('rooms').doc(roomId)
        const offer = await connection.createOffer()
        const roomWithOffer = {
            offer: {
                type: offer.type,
                sdp: offer.sdp,
            },
        }
        await room.set(roomWithOffer)

        const unSubscribeChanel = get().setDataChannelSubscriptions(connection, channel => ({
            onopen: () =>
                set(
                    produce(state => {
                        state.connections[roomId].responseDataChannel = channel
                    })
                ),
            onclose: () =>
                set(
                    produce(state => {
                        state.connections[roomId].responseDataChannel = undefined
                    })
                ),
        }))

        const unsubscribeConnection = await setSubscriptionsOnRegister(connection, room, true)
        const unsubscribe = () => {
            unsubscribeConnection()
            unSubscribeChanel()
        }
        set(
            produce(state => {
                state.connections[roomId] = { connection, unsubscribe, dataChannel, roomId }
            })
        )
    },
    removeConnection: async roomId => {
        const connection = get().connections[roomId]
        if (!connection) return
        if (connection.unsubscribe) connection.unsubscribe()
        await deleteDoc(doc(get().db, 'rooms', roomId))
        set(
            produce(state => {
                delete state.connections[roomId]
            })
        )
    },
    setDataChannelSubscriptions: (connection, getHandlers, roomId) => {
        const onDataChannel = e => {
            const handlers = getHandlers(e.channel)
            e.channel.onopen = e => {
                get().log(`${roomId} OPEN`, e)
                handlers.onopen && handlers.onopen(e)
            }
            e.channel.onerror = e => {
                get().log(`${roomId} ERROR`, e)
                handlers.onerror && handlers.onerror(e)
            }
            e.channel.onclose = async e => {
                get().log(`${roomId} CLOSE`, e)
                // set(
                //     produce(state => {
                //         state.connections[roomId].responseDataChannel = undefined
                //     })
                // )
                handlers.onclose && handlers.onclose(e)
            }
        }
        connection.addEventListener('datachannel', onDataChannel)

        return () => connection.removeEventListener('datachannel', onDataChannel)
        //todo разрулить с отписками
    },

    connectToRoom: async roomId => {
        const room = get().db.collection('rooms').doc(roomId)
        const roomSnapshot = await room.get()
        if (!roomSnapshot.exists) return
        const connection = new RTCPeerConnection(config)
        connection.onconnectionstatechange = () =>
            set(
                produce(state => {
                    if (get().connections[roomId]) state.connections[roomId].status = connection.connectionState
                })
            )
        const dataChannel = connection.createDataChannel('DataChannel')
        const unsubscribe = await setSubscriptionsOnRegister(connection, room)
        const offer = roomSnapshot.data().offer
        await connection
            .setRemoteDescription(new RTCSessionDescription(offer))
            .catch(e => console.log('setRemoteDescription err B', e))
        console.log('connection'.toUpperCase(), connection)
        const answer = await connection.createAnswer()
        await connection.setLocalDescription(answer).catch(e => console.log('setLocalDescription err B', e))
        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp,
            },
        }
        await room.update(roomWithAnswer)
        set(
            produce(state => {
                if (state.connections[roomId]) {
                    if (!state.connections[roomId].childConnections) state.connections[roomId].childConnections = []
                    state.connections[roomId].childConnections.push({
                        connection,
                        unsubscribe,
                        dataChannel,
                    })
                } else {
                    state.connections[roomId] = {
                        connection,
                        unsubscribe,
                        dataChannel,
                    }
                }
            })
        )
    },
    selectConnection: roomId => {
        set(
            produce(state => {
                state.selectedConnection = state[roomId]
            })
        )
    },
    log: (title, ...args) => {
        if ((import.meta.env.mode = 'develop')) {
            console.log(`%c ${title}`, 'color: magenta', ...args)
        }
    },
}))
