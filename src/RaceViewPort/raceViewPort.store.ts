import { create } from 'zustand'

interface RotationSpeed {
    srX: number
    srY: number
    srZ: number
}

interface JetStore extends RotationSpeed {
    moveSpeed: number
    setRotationSpeed: (speed: Partial<RotationSpeed>) => void
    setMoveSpeed: (speed: number) => void
}

export const useJetStore = create<JetStore>((set, get) => ({
    srX: 0,
    srY: 0,
    srZ: 0,
    moveSpeed: 0,
    setRotationSpeed: speed => set(state => ({ ...state, ...speed })),
    setMoveSpeed: moveSpeed => set(state => ({ ...state, moveSpeed })),
}))
