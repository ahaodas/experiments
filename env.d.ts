/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_METERED_USER: string
    readonly VITE_METERED_CREDENTIAL: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface DataChannelHandlers {
    onerror?: (e: Event) => void
    onopen?: (e: Event) => void
    onclose?: (e: Event) => void
    onmessage?: (e: Event) => void
}
