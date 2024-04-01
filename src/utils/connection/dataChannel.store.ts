import { create } from 'zustand'

interface DataChannelStore {
    outChannel?: RTCDataChannel
    inputChannel?: RTCDataChannel
    bindChannels: (inputChannel: RTCDataChannel, outChannel: RTCDataChannel) => void
    sendData: (data: string) => void
}

export const useDataChannelStore = create<DataChannelStore>((set, get) => ({
    bindChannels: (inputChannel, outChannel) => {
        set(state => ({ ...state, inputChannel, outChannel }))
        //  inputChannel.onclose = () => set(state => ({ ...state, inputChannel: undefined }))
        //  outChannel.onclose = () => set(state => ({ ...state, outChannel: undefined }))
    },
    sendData: (data: string) => get().outChannel?.send(data),
}))
