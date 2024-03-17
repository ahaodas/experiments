import React from 'react'

const Chat: React.FC<{ user: string; messages: Array<{ text: string; user: string }> }> = ({ user, messages }) => {
    return (
        <div
            style={{
                height: 200,
                overflow: 'auto',
                outline: '1px dashed white',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {messages.map((message, i) => {
                const isMy = user === message.user
                return (
                    <div key={i} style={{ display: 'flex', justifyContent: isMy ? 'end' : 'start' }}>
                        <div
                            style={{
                                display: 'inline-block',
                                borderRadius: 8,
                                marginBottom: 10,
                                backgroundColor: isMy ? '#444' : '#999',
                                padding: '2px 5px',
                            }}
                        >
                            <div style={{ fontSize: 10, color: '#eee' }}>{message.user}</div>
                            <div>{message.text}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
export default Chat
