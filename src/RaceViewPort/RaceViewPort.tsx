import React from 'react'
import { initialR } from '@assets/orange-jet2'
import { Model } from '@desktop-app/GameEngine/Playground'
import CameraContainer from '@desktop-app/CameraContainer'
import { useJetStore } from './raceViewPort.store'
import { GraphicWrapper } from './GraphicWrapper'
import { useRaceKeyBoard } from './useRaceKeyBoard'

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

const RaceViewPort = () => {
    useRaceKeyBoard()
    const { srX, srY, srZ, moveSpeed } = useJetStore()
    return (
        <GraphicWrapper>
            <CameraContainer srX={srX} srY={srY} srZ={srZ} moveSpeed={moveSpeed}>
                <Model scale={0.5} position={[0, 0, 0]} rotation={[initialR.rX, initialR.rY, initialR.rZ]} />
            </CameraContainer>
            <Statists />
        </GraphicWrapper>
    )
}
