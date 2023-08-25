import QRCode from 'qrcode'
import { init } from './desktopScript'
export const roomCreator =
    ({ db, peerConnection }) =>
    async () => {
        const roomRef = await db.collection('rooms').doc()
        const callerCandidatesCollection = roomRef.collection('callerCandidates')
        peerConnection.addEventListener(
            'icecandidate',
            event => event.candidate && callerCandidatesCollection.add(event.candidate.toJSON())
        )
        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        const roomWithOffer = {
            offer: {
                type: offer.type,
                sdp: offer.sdp,
            },
        }
        await roomRef.set(roomWithOffer)

        const link = location.href + '?roomId=' + roomRef.id
        console.log(link)
        QRCode.toDataURL(link)
            .then(url => {
                const img = document.createElement('img')
                img.src = url
                img.id = 'img'
                img.style.margin = 'auto'
                img.style.width = '300px'
                img.style.display = 'block'
                document.body.prepend(img)
            })
            .catch(err => {
                console.error(err)
            })

        roomRef.onSnapshot(async snapshot => {
            const data = snapshot.data()
            if (!peerConnection.currentRemoteDescription && data && data.answer) {
                const rtcSessionDescription = new RTCSessionDescription(data.answer)
                await peerConnection.setRemoteDescription(rtcSessionDescription)
            }
        })
        roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data()
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data))
                }
            })
        })
    }

export const gameViewOnDataChannel =
    (dataChannel: RTCDataChannel) =>
    ({ channel }: RTCDataChannelEvent) => {
        const img = document.getElementById('img')
        channel.onopen = async () => {
            img.style.display = 'none'
            await init(dataChannel)
        }
        channel.onclose = () => {
            img.style.display = 'inline-block'
        }
    }
