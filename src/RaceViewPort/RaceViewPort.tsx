import React, { useEffect } from 'react'
import { initialR } from '@assets/orange-jet2'
import { Model as Jet2 } from '@assets/orange-jet2/Jet2'
import { Model } from '@desktop-app/GameEngine/Playground'
import CameraContainer from '@desktop-app/CameraContainer'
import { useJetStore } from './raceViewPort.store'
import { GraphicWrapper } from './GraphicWrapper'
import { useRaceKeyBoard } from './useRaceKeyBoard'
import { MessageType, useSessionDataStore } from 'utils/session/session.store'
import { useDataChannelStore } from 'utils/connection/dataChannel.store'

const Statists = () => {
    return (
        <>
            <Model position={[15, 10, -12]} />
            <Model position={[22, -12, 12]} />
            <Model position={[-20, 15, 31]} />
            <Model position={[-40, 0, -18]} />
        </>
    )
}

export const RaceViewPort = () => {
    useRaceKeyBoard()
    const { srX, srY, srZ, moveSpeed, setMoveSpeed, setRotationSpeed } = useJetStore()
    const { inputChannel, outChannel } = useDataChannelStore()
    useEffect(() => {
        inputChannel.onmessage = e => {
            const data = JSON.parse(e.data)
            console.log(data)
            const { moveSpeed, ...rotation } = data
            setMoveSpeed(moveSpeed)
            setRotationSpeed(rotation)
        }
    }, [])

    return (
        <GraphicWrapper>
            <CameraContainer srX={srX} srY={srY} srZ={srZ} moveSpeed={moveSpeed}>
                <Jet2 scale={0.5} position={[0, 0, 0]} rotation={[initialR.rX, initialR.rY, initialR.rZ]} />
            </CameraContainer>
            <Statists />
        </GraphicWrapper>
    )
}
