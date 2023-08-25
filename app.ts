import firebase from 'utils/firebaseInit'
import config from 'utils/webRTCconfig'
import { createHandler } from 'utils/common'
import { rcOndatachannel, roomJoiner } from '@remote-controller/RemoteController'
import { gameViewOnDataChannel, roomCreator } from '@game-view/GameView'

const initPage = async () => {
    const peerConnection = new RTCPeerConnection(config)
    const dataChannel = peerConnection.createDataChannel('dc')
    const db = firebase.firestore()
    const joinRoom = createHandler<string>({ peerConnection, db }, roomJoiner)
    const createRoom = createHandler({ peerConnection, db }, roomCreator)
    const roomId = new URLSearchParams(location.search).get('roomId')
    try {
        if (roomId) {
            await joinRoom(roomId)
            peerConnection.ondatachannel = rcOndatachannel
        } else {
            await createRoom()
            peerConnection.ondatachannel = gameViewOnDataChannel(dataChannel)
        }
    } catch (e) {
        const div = document.createElement('div')
        div.style.fontStyle = 'italic'
        div.style.color = 'tomato'
        div.style.fontSize = '2rem'
        div.innerText = e
        document.body.appendChild(div)
    }
}

window.onload = () => initPage().catch(console.log)

document.body.onclick = async () => {
  try {
    await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
  } catch (e) {
    console.log(e)
  }
}


