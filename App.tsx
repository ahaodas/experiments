import React from 'react'
import { Outlet, RouterProvider } from 'react-router'
import { createHashRouter, Link } from 'react-router-dom'
import firebase from 'utils/FireBase/firebaseInit'
import { ConnectionService } from 'utils/connection/ConnectionService'
import { createRoot } from 'react-dom/client'
import RemoteControlView from '@mobile-app/RemoteControlView'
import RaceView from '@desktop-app/RaceView'
import OuterLayout from 'components/OuterLayout'
import InnerLayout from 'components/InnerLayout'
import ConnectionContext from 'utils/connection/ConnectionContext'
import Playground from '@desktop-app/GameEngine/Playground'
import TestWebRtc from './src/Connection/TestWebRtc'
import TestJoinRoom from './src/Connection/TestJoinRoom'

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
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'race'}>
                Start
            </Link>
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'playground'}>
                Playground
            </Link>
            <Link style={{ fontSize: '5rem', color: 'white' }} to={'testWebRtc'}>
                TestWebRtc
            </Link>
        </InnerLayout>
    )
}
export const router = createHashRouter([
    {
        path: '/',
        element: (
            <OuterLayout>
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
        ],
    },
])

const db = firebase.firestore()
const connectionService = new ConnectionService(db)
const App = () => {
    return <RouterProvider router={router} />
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
