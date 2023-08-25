export default {
    iceServers: [
        {
            urls: [
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                //  "stun:stun4.l.google.com:19302",
            ],
        },
        {
            urls: 'turn:a.relay.metered.ca:80?transport=udp',
            username: import.meta.env.VITE_METERED_USER,
            credential: import.meta.env.VITE_METERED_CREDENTIAL,
        },
    ],
    iceCandidatePoolSize: 10,
}
