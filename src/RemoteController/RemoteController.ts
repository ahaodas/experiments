const filterRotation = deg => (deg > 180 ? deg - 360 : deg)
const handleMove = (channel: RTCDataChannel) => e =>
    channel.send(
        JSON.stringify({
            z: filterRotation(Math.round(e.alpha)),
            x: filterRotation(Math.round(e.beta)),
            y: Math.round(e.gamma),
        })
    )
export const getRemoteControlHandlers = (channel: RTCDataChannel): DataChannelHandlers => ({
    onopen: () => {
        const button = document.createElement('button')
        button.innerText = 'START'
        button.style.fontSize = '3rem'
        button.onclick = async () => {
            if (
                // @ts-ignore
                !DeviceOrientationEvent?.requestPermission ||
                // @ts-ignore
                (await DeviceOrientationEvent.requestPermission()) === 'granted'
            ) {
                window.addEventListener('deviceorientation', handleMove(channel))
                button.style.display = 'none'
            }
        }
        document.body.appendChild(button)
    },
})
