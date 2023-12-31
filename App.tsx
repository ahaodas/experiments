import React from 'react'
import { Outlet, RouterProvider } from 'react-router'
import { createHashRouter, Link} from 'react-router-dom'
import firebase from 'utils/FireBase/firebaseInit'
import { ConnectionService } from 'utils/connection/ConnectionService'
import { createRoot } from 'react-dom/client'
import RemoteControlView from '@mobile-app/RemoteControlView'
import RaceView from '@desktop-app/RaceView'
import OuterLayout from 'components/OuterLayout'
import InnerLayout from "components/InnerLayout";
import ConnectionContext from 'utils/connection/ConnectionContext'

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
                element: (
                    <InnerLayout>
                        <Link style={{ fontSize: '5rem', color: 'white' }} to={'race'}>
                            Start
                        </Link>
                    </InnerLayout>
                ),
            },
            {
                path: 'race',
                element: <RaceView />,
            },
            {
                path: 'race/:raceId',
                element: <RemoteControlView />,
            },
        ],
    },
])


const db = firebase.firestore()
const connectionService = new ConnectionService(db)
const App = () => {
    return (
        <ConnectionContext.Provider value={connectionService}>
            <RouterProvider router={router} />
        </ConnectionContext.Provider>
    )
}

const root = createRoot(document.getElementById('app'))
root.render(<App />)
