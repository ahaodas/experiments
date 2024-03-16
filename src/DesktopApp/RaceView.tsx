import React, { useContext, useEffect, useRef, useState } from 'react'
import './desktopStyles.css'
import QRCode from 'react-qr-code'
import Index from 'components/OuterLayout'
import InnerLayout from 'components/InnerLayout'
import ConnectionContext from 'utils/connection/ConnectionContext'
import { Link } from 'react-router-dom'
import GameEngine, { GameDataMessage } from './GameEngine/Classes/GameEngine'
import ViewPort from '@desktop-app/GameEngine/Camera/ViewPort'
import Ship from '@desktop-app/GameEngine/Shapes/Ship'
import SceneWrapper from '@desktop-app/GameEngine/Camera/Scene'
import Scene from '@desktop-app/GameEngine/Classes/Scene'

const scene = new Scene()
const game = new GameEngine(scene)

const Markup = () => {
    const { dataChannel } = useContext(ConnectionContext)
    const [state, setState] = useState(game)
    useEffect(() => {
        dataChannel.onmessage = message => {
            // const newState = game.onMessage(JSON.parse(message.data))
            //   setState({ ...newState })
            console.log('dataChannel.onmessage', message.data)
        }
    }, [])

    return state.scene ? (
        <ViewPort>
            <SceneWrapper scene={state.scene} />
            <Ship />
        </ViewPort>
    ) : null
}

const RaceView = () => {
    const connectionService = useContext(ConnectionContext)
    const [raceId, setRaceId] = useState(null)
    const [connected, setConnected] = useState(false)
    const [gameOver, setGameOver] = useState(false)
    useEffect(() => {
        connectionService.createRoom().then(raceId => {
            setRaceId(raceId)
            setGameOver(false)
            console.log('for debug:', `${location.href}/${raceId}`)
            connectionService.setDataChannelSubscriptions(() => ({
                onopen: () => {
                    setConnected(true)
                    setRaceId(null)
                },
                onclose: () => {
                    setGameOver(true)
                    setConnected(false)
                },
            }))
        })
        //    return connectionService.clearStore()
    }, [])

    return (
        <Index>
            {connected ? (
                <Markup />
            ) : (
                <InnerLayout>
                    {gameOver ? (
                        <div>
                            <div
                                onClick={() => location.reload()}
                                style={{ cursor: 'pointer', color: 'white', fontSize: '2rem' }}
                            >
                                New race
                            </div>
                            <Link style={{ textDecoration: 'none', color: 'white', fontSize: '2rem' }} to={'../'}>
                                Main menu
                            </Link>
                        </div>
                    ) : raceId ? (
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
