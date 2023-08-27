import React from 'react'
import styles from './OuterLayout.module.less'
const Index: React.FC<{ children: React.ReactElement }> = ({ children }) => <div className={styles.root}>{children}</div>

export default Index
