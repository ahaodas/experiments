import React from 'react'
import styles from './InnerLayout.module.less'

const InnerLayout: React.FC<{ children: React.ReactElement }> = ({ children }) => <div className={styles.root}>{children}</div>

export default InnerLayout
