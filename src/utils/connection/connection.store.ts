import { create } from 'zustand'
import firebase from 'firebase/compat'
import Firestore = firebase.firestore.Firestore
import { produce } from 'immer'
import config from 'utils/webRTCconfig'
import {
    getAlternateConnectionName,
    offerIsValid,
    setSubscriptionsOnRegister,
} from 'utils/connection/utils/setSubscriptionsOnRegister'
import { deleteDoc, doc, getDocs } from 'firebase/firestore'

export interface StoredConnection {
    connection?: RTCPeerConnection
    unsubscribe?: () => void
    dataChannel: RTCDataChannel
    childConnections?: StoredConnection[]
}

interface ConnectionStore {
    db: Firestore
    connections: Record<string, StoredConnection>
    addRoom: (withConnection?: boolean) => Promise<void>
    loadRooms: () => Promise<void>
    removeConnection: (roomId: string) => Promise<void>
    disableConnection: (roomId: string) => void
    initConnectionForRoom: (roomId: string) => Promise<void>
    setDataChannelSubscriptions: (
        connection: RTCPeerConnection,
        getHandlers: (channel?: RTCDataChannel) => DataChannelHandlers,
        roomId?: string
    ) => void

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

    addRoom: async withConnection => {
        const rooms = get().db.collection('rooms')
        const room = await rooms.add({})
        set(
            produce(state => {
                state.connections[room.id] = {}
            })
        )
        if (withConnection) {
            await get().initConnectionForRoom(room.id)
        }
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
    initConnectionForRoom: async roomId => {
        const connection = new RTCPeerConnection(config)
        const dataChannel = connection.createDataChannel('DataChannel')
        const room = get().db.collection('rooms').doc(roomId)
        const existingOffer = await room.get()
        if (!existingOffer || !offerIsValid(existingOffer.data())) {
            const offer = await connection.createOffer()
            await connection.setLocalDescription(offer)
            const roomWithOffer = {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp,
                },
            }
            await room.set(roomWithOffer)
        }
        const unsubscribe = await setSubscriptionsOnRegister(connection, room, true)
        set(
            produce(state => {
                state.connections[roomId] = { connection, unsubscribe, dataChannel }
            })
        )
    },
    setDataChannelSubscriptions: (connection, getHandlers, roomId) => {
        const onDataChannel = e => {
            const handlers = getHandlers(e.channel)
            e.channel.onopen = e => {
                get().log(`${roomId} OPEN`, e)
                handlers.onopen(e)
            }
            e.channel.onerror = e => {
                get().log(`${roomId} ERROR`, e)
                handlers.onerror(e)
            }
            e.channel.onclose = async e => {
                get().log(`${roomId} CLOSE`, e)
                handlers.onclose(e)
            }
        }
        connection.addEventListener('datachannel', onDataChannel)
        //todo разрулить с отписками
    },

    connectToRoom: async roomId => {
        const room = get().db.collection('rooms').doc(roomId)
        const roomSnapshot = await room.get()
        if (!roomSnapshot.exists) return
        const connection = new RTCPeerConnection(config)
        const dataChannel = connection.createDataChannel('DataChannel')
        const unsubscribe = await setSubscriptionsOnRegister(connection, room)
        const offer = roomSnapshot.data().offer
        await connection
            .setRemoteDescription(new RTCSessionDescription(offer))
            .catch(e => console.log('setRemoteDescription err B', e))
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
    log: (title, ...args) => {
        if ((import.meta.env.mode = 'develop')) {
            console.log(`%c ${title}`, 'color: magenta', ...args)
        }
    },
}))
