import React from 'react'
import styles from './OuterLayout.module.less'

const Index: React.FC<React.PropsWithChildren> = ({ children }) => <div className={styles.root}>{children}</div>

export default Index
