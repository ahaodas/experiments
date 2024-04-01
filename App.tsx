import React, { StrictMode } from 'react'
import { Outlet, RouterProvider } from 'react-router'
import { createHashRouter, Link } from 'react-router-dom'
import firebase from 'utils/FireBase/firebaseInit'
import { createRoot } from 'react-dom/client'
import RemoteControlView from '@mobile-app/RemoteControlView'
import RaceView from '@desktop-app/RaceView'
import OuterLayout from 'components/OuterLayout'
import InnerLayout from 'components/InnerLayout'
import Playground from '@desktop-app/GameEngine/Playground'
import TestWebRtc from './src/Connection/TestWebRtc'
import TestJoinRoom from './src/Connection/TestJoinRoom'
import { ConnectionStatus, ExistingRoom, TestCreateRoom } from './src/Connection/TestOneRoom'
import { RaceViewPort } from './src/RaceViewPort/RaceViewPort'
import { HelmView } from './src/RaceViewPort/HelmView/HelmView'

const MainMenu = () => {
    const handleClick = async () => {
        try {
            await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <InnerLayout>
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'new-race'}>
                Start
            </Link>
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'playground'}>
                Playground
            </Link>
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'testWebRtc'}>
                TestWebRtc
            </Link>
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'testOneRoom'}>
                testOneRoom
            </Link>
        </InnerLayout>
    )
}
export const router = createHashRouter([
    {
        path: '/',
        element: (
            <OuterLayout>
                <ConnectionStatus />
                <Outlet />
            </OuterLayout>
        ),
        children: [
            {
                path: '/',
                element: <MainMenu />,
            },
            {
                path: 'race',
                element: <RaceView />,
            },
            {
                path: 'race/:raceId',
                element: <RemoteControlView />,
            },
            {
                path: 'playground',
                element: <Playground />,
            },
            {
                path: 'testWebRtc',
                element: <TestWebRtc />,
            },
            {
                path: 'joinRoom/:roomId',
                element: <TestJoinRoom />,
            },
            {
                path: 'testOneRoom',
                element: <TestCreateRoom />,
            },
            {
                path: 'testOneRoom/:roomId',
                element: <ExistingRoom />,
            },
            {
                path: 'controllerView/:roomId',
                element: <TestJoinRoom />,
            },
            {
                path: 'new-race',
                element: <RaceViewPort />,
            },
            {
                path: 'helm/:roomId',
                element: <HelmView />,
            },
        ],
    },
])

const db = firebase.firestore()
//const connectionService = new ConnectionService(db)
const App = () => {
    return <RouterProvider router={router} />
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
