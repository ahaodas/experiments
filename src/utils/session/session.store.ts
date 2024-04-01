import { create } from 'zustand'
import { produce } from 'immer'

interface Session {
    sessionId?: string
    sessionMessages?: any[]
    meta?: Record<string, string>
}

interface SessionStore {
    currentSession?: Session
    createSession: (meta?: Record<string, string>) => void
    clearSession: () => void
    restoreSession: (session: Session) => void
    pushSessionMessage: (messageData: TextMessageData) => void
    processMessage: (message: SessionRestoreMessage | SessionTextMessage) => void
}

export enum MessageType {
    session,
    text,
}

export interface SessionMessage {
    type: MessageType
}

export interface SessionRestoreMessage extends SessionMessage {
    type: MessageType.session
    data: Session
}

interface TextMessageData {
    user: string
    text: string
}

export interface SessionTextMessage extends SessionMessage {
    type: MessageType.text
    data: TextMessageData
}

export const useSessionDataStore = create<SessionStore>((set, get) => ({
    createSession: meta => {
        const sessionId = new Date().getTime().toString()
        set(
            produce(state => {
                state.currentSession = {
                    sessionId,
                    meta,
                    sessionMessages: [],
                }
            })
        )
    },
    clearSession: () =>
        set(
            produce(state => {
                state.currentSession = null
            })
        ),
    restoreSession: session => {
        set(
            produce(state => {
                const {
                    meta: { user, userB },
                } = session
                state.currentSession = {
                    ...session,
                    meta: { ...session.meta, user: userB, userB: user },
                }
            })
        )
    },
    pushSessionMessage: message =>
        set(
            produce(state => {
                state.currentSession.sessionMessages.push(message)
            })
        ),
    processMessage: message => {
        switch (message.type) {
            case MessageType.text:
                if (!get().currentSession?.meta?.userB)
                    set(
                        produce(state => {
                            state.currentSession.meta = {
                                ...state.currentSession.meta,
                                userB: message.data.user,
                            }
                        })
                    )
                get().pushSessionMessage(message.data)
                break
            case MessageType.session:
                get().restoreSession(message.data)
                break
            default:
                console.warn('unsupported type of message', { message })
        }
    },
}))
