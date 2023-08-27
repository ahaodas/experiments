import React, { useContext, useEffect, useState } from 'react'
import './desktopStyles.css'
import { init } from './desktopScript'
import QRCode from 'react-qr-code'
import Index from 'components/OuterLayout'
import InnerLayout from 'components/InnerLayout'
import ConnectionContext from 'utils/connection/ConnectionContext'
const Markup = () => {
    const connectionService = useContext(ConnectionContext)
    useEffect(() => {
        init(connectionService.dataChannel)
    }, [])
    return (
        <div className="root scene" id="scene">
            <div className="reflectionContainer" id="mirror"></div>
            <div className="scene scene_sub grid" id="subscene">
                <div className="x-axis axis baseV2" id="spinbase"></div>
                <div className="ufo">
                    <div className="s sbc">back 🔜</div>
                    <div className="s sf">front 🔜</div>
                    <div className="s sl">left 🔜</div>
                    <div className="s sr">right 🔜</div>
                    <div className="s st">top 🔜</div>
                    <div className="s sb">bottom 🔜</div>
                </div>
                <div className="ufo ufo2">
                    <div className="s sbc">back 🔜</div>
                    <div className="s sf">front 🔜</div>
                    <div className="s sl">left 🔜</div>
                    <div className="s sr">right 🔜</div>
                    <div className="s st">top 🔜</div>
                    <div className="s sb">bottom 🔜</div>
                </div>
            </div>
            <div className="mc" id="ship">
                <div className="c cl">
                    <div className="s sbc"></div>
                    <div className="s sf"></div>
                    <div className="s sl"></div>
                    <div className="s sr"></div>
                    <div className="s st"></div>
                    <div className="s sb"></div>
                </div>
                <div className="c cr">
                    <div className="s sbc"></div>
                    <div className="s sf"></div>
                    <div className="s sl"></div>
                    <div className="s sr"></div>
                    <div className="s st"></div>
                    <div className="s sb"></div>
                </div>
                <div className="c cm oppo">
                    <div className="s sbc"></div>
                    <div className="s sf"></div>
                    <div className="s sl"></div>
                    <div className="s sr"></div>
                    <div className="s st"></div>
                    <div className="s sb"></div>
                </div>
            </div>
        </div>
    )
}

const RaceView = () => {
    const connectionService = useContext(ConnectionContext)
    const [raceId, setRaceId] = useState(null)
    const [connected, setConnected] = useState(false)
    useEffect(() => {
        connectionService.createRoom().then(raceId => {
            setRaceId(raceId)
            connectionService.setDataChannelSubscriptions(() => ({
                onopen: () => {
                    setConnected(true)
                    setRaceId(null)
                },
                onclose: () => setConnected(false),
            }))
        })
        return connectionService.clearStore
    }, [])

    return (
        <Index>
            {connected ? (
                <Markup />
            ) : (
                <InnerLayout>
                    {raceId ? (
                        <QRCode fgColor="cyan" bgColor="transparent" value={`${location.href}/${raceId}`} />
                    ) : (
                        <div style={{ color: 'magenta', fontSize: '2rem' }}>Creating race...</div>
                    )}
                </InnerLayout>
            )}
        </Index>
    )
}

export default RaceView
