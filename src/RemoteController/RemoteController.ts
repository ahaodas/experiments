export const roomJoiner =
    ({ db, peerConnection }) =>
    async (roomId: string) => {
        const dbRoom = db.collection('rooms').doc(`${roomId}`)
        const roomSnapshot = await dbRoom.get()
        if (!roomSnapshot.exists) return
        const calleeCandidatesCollection = dbRoom.collection('calleeCandidates')
        peerConnection.addEventListener(
            'icecandidate',
            event => event.candidate && calleeCandidatesCollection.add(event.candidate.toJSON())
        )
        const offer = roomSnapshot.data().offer
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await peerConnection.createAnswer()
        await peerConnection.setLocalDescription(answer)
        const roomWithAnswer = {
            answer: {
                type: answer.type,
                sdp: answer.sdp,
            },
        }
        await dbRoom.update(roomWithAnswer)
        dbRoom.collection('callerCandidates').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(async change => {
                if (change.type === 'added') {
                    let data = change.doc.data()
                    await peerConnection.addIceCandidate(new RTCIceCandidate(data))
                }
            })
        })
    }

const filterRotation = deg => (deg > 180 ? deg - 360 : deg)
const handleMove = (channel: RTCDataChannel) => async e =>
    channel.send(
        JSON.stringify({
            z: filterRotation(Math.round(e.alpha)),
            x: filterRotation(Math.round(e.beta)),
            y: Math.round(e.gamma),
        })
    )

export const rcOndatachannel = ({ channel }: RTCDataChannelEvent) =>
    (channel.onopen = () => {
        const button = document.createElement('button')
        button.innerText = 'START'
        button.style.fontSize = '3rem'
        button.onclick = async () => {
            if (
                // @ts-ignore
                (await DeviceOrientationEvent.requestPermission()) === 'granted'
            )
                window.addEventListener('deviceorientation', handleMove(channel))
            button.style.display = 'none'
        }
        document.body.appendChild(button)
    })
