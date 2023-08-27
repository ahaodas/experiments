import firebase from 'firebase/compat'
import { doc, deleteDoc } from 'firebase/firestore'
import Firestore = firebase.firestore.Firestore
import config from 'utils/webRTCconfig'

export class ConnectionService {
    peerConnection: RTCPeerConnection
    store: Firestore
    dataCh: RTCDataChannel
    roomId?: string
    constructor(store) {
        this.store = store
        this.peerConnection = new RTCPeerConnection(config)
        this.dataCh = this.peerConnection.createDataChannel('dc')
    }

    get dataChannel() {
        return this.dataCh
    }

    setDataChannelSubscriptions(getHandlers: (channel?: RTCDataChannel) => DataChannelHandlers) {
        this.peerConnection.addEventListener('datachannel', e => {
            const handlers = getHandlers(e.channel)
            e.channel.onopen = e => {
                this.log('OPEN', e)
                // @ts-ignore
                handlers.onopen(e)
            }
            e.channel.onerror = e => {
                this.log('ERROR', e)
                // @ts-ignore
                handlers.onerror(e)
            }
            e.channel.onclose = async e => {
                this.log('CLOSE', e)
                // @ts-ignore
                handlers.onclose(e)
                await this.clearStore()
            }
            e.channel.onmessage = e => {
                this.log('MESSAGE', e)
                // @ts-ignore
                handlers.onmessage(e)
            }
        })
    }

    private log(title: string, ...args: any[]) {
        if ((import.meta.env.mode = 'develop')) {
            console.log(`%c ${title}`, 'color: magenta', ...args)
        }
    }
    async clearStore() {
        if (this.roomId) await deleteDoc(doc(this.store, 'rooms', this.roomId))
    }
    private async getRoomRef() {
        return this.store.collection('rooms').doc(this.roomId)
    }
    async createRoom(callBack?: (roomId: string) => void) {
        const roomRef = await this.getRoomRef()
        const callerCandidatesCollection = roomRef.collection('callerCandidates')
        this.peerConnection.addEventListener(
            'icecandidate',
            event => event.candidate && callerCandidatesCollection.add(event.candidate.toJSON())
        )
        const offer = await this.peerConnection.createOffer()
        await this.peerConnection.setLocalDescription(offer)
        const roomWithOffer = {
            offer: {
                type: offer.type,
                sdp: offer.sdp,
            },
        }
        await roomRef.set(roomWithOffer)
        this.roomId = roomRef.id
        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data()
            if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
                const rtcSessionDescription = new RTCSessionDescription(data.answer)
                await this.peerConnection.setRemoteDescription(rtcSessionDescription)
            }
        })
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data()
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
                }
            })
        })
        return roomRef.id
        //callBack && callBack(roomRef.id)
    }
    async joinRoom(roomId: string) {
        this.roomId = roomId
        const roomRef = await this.getRoomRef()
        const roomSnapshot = await roomRef.get()
        if (!roomSnapshot.exists) return
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates')
        this.peerConnection.addEventListener(
            'icecandidate',
            event => event.candidate && calleeCandidatesCollection.add(event.candidate.toJSON())
        )
        const offer = roomSnapshot.data().offer
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp,
            },
        }
        await roomRef.update(roomWithAnswer)
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data()
                    await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
                }
            })
        })
    }
}
