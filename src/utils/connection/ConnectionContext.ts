import React from 'react'
import { ConnectionService } from 'utils/connection/ConnectionService'

const ConnectionContext = React.createContext<ConnectionService>(null)

export default ConnectionContext
