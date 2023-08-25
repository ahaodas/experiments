import firebase from 'firebase/compat'
import Firestore = firebase.firestore.Firestore

interface DataContext {
    peerConnection: RTCPeerConnection
    db: Firestore
    dataChannel?: RTCDataChannel
}

export const createHandler = <I = any[] | undefined, O = void>(
    ctx: DataContext,
    // todo: make it clear
    callBack: (context: DataContext) => (input?: I) => O
) => callBack(ctx)
