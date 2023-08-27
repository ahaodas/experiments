import { init } from './desktopScript'
export const getGameViewHandlers = (rootChannel: RTCDataChannel): () => DataChannelHandlers => {
    const img = document.getElementById('img')
    return () => ({
        onopen: async () => {
            img.style.display = 'none'
            await init(rootChannel)
        },
        onclose: () => {
            img.style.display = 'inline-block'
        },
    })
}