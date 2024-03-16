import React from 'react'
import styles from './ViewPort.module.less'

const ViewPort: React.FC<React.PropsWithChildren> = ({ children }) => <div className={styles.root}>{children}</div>

export default ViewPort
