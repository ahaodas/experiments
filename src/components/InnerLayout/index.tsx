import React from 'react'
import styles from './InnerLayout.module.less'

const InnerLayout: React.FC<React.PropsWithChildren> = ({ children }) => <div className={styles.root}>{children}</div>

export default InnerLayout
