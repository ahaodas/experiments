import firebase from 'firebase/compat'
import DocumentReference = firebase.firestore.DocumentReference
import DocumentData = firebase.firestore.DocumentData

export interface OfferData {
    offer?: {
        sdp?: string
        type?: 'offer'
    }
}

export const offerIsValid = (data?: OfferData) =>
    Boolean(data.offer) && Boolean(data.offer.sdp) && Boolean(data.offer.type) && data.offer.type == 'offer'

export const getAlternateConnectionName = (roomId: string) => `b_side_${roomId}`

export const setSubscriptionsOnRegister = async (
    connection: RTCPeerConnection,
    room: DocumentReference<DocumentData>,
    isInitiator?: boolean
) => {
    const callerCandidatesCollection = room.collection('callerCandidates')
    const onICECandidate = event => {
        event.candidate && callerCandidatesCollection.add(event.candidate.toJSON())
    }
    connection.addEventListener('icecandidate', onICECandidate)

    const existingRoomData = await room.get()
    const existingOffer = existingRoomData.data().offer
    const existingAnswer = existingRoomData.data().answer
    if (isInitiator) {
        if (existingOffer)
            await connection.setLocalDescription(new RTCSessionDescription(existingOffer)).catch(e => console.log(e.message))
        if (existingAnswer && !connection.currentRemoteDescription) {
            await connection.setRemoteDescription(new RTCSessionDescription(existingAnswer)).catch(console.log)
        }
    } else {
        if (existingAnswer) await connection.setLocalDescription(new RTCSessionDescription(existingAnswer)).catch(console.log)
        if (existingOffer && !connection.currentRemoteDescription) {
            await connection.setRemoteDescription(new RTCSessionDescription(existingOffer)).catch(console.log)
        }
    }

    const existingICECandidates = await callerCandidatesCollection.get()
    existingICECandidates.forEach(x => {
        connection.addIceCandidate(new RTCIceCandidate(new RTCIceCandidate(x.data())))
    })

    const unsubscribeCandidates = callerCandidatesCollection.onSnapshot(snapshot => {
        snapshot.docChanges().forEach(storedCandidate => {
            if (storedCandidate.type === 'added') {
                connection.addIceCandidate(new RTCIceCandidate(storedCandidate.doc.data()))
            }
        })
    })

    let unsubscribeRoom
    if (isInitiator) {
        unsubscribeRoom = room.onSnapshot(async snapshot => {
            const data = snapshot.data()
            if (!connection.currentRemoteDescription && data && data.answer) {
                await connection.setRemoteDescription(new RTCSessionDescription(data.answer))
            }
        })
    }

    return () => {
        connection.removeEventListener('icecandidate', onICECandidate)
        unsubscribeRoom && unsubscribeRoom()
        unsubscribeCandidates()
    }
}
