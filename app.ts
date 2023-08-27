import firebase from 'utils/FireBase/firebaseInit'
import { ConnectionService } from 'utils/connection/ConnectionService'

const initPage = async () => {
    const db = firebase.firestore()
    const service = new ConnectionService(db)
    const roomId = new URLSearchParams(location.search).get('roomId')
    try {
        if (roomId) {
            const mobileView = await import('@remote-controller/RemoteController')
            await service.joinRoom(roomId)
            service.setDataChannelSubscriptions(mobileView.getRemoteControlHandlers)
        } else {
            const desktopView = await import('@game-view/GameView')
            await service.createRoom(desktopView.placeQR)
            service.setDataChannelSubscriptions(desktopView.getGameViewHandlers(service.dataChannel))
        }
    } catch (e) {
        //tmp error handling
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
