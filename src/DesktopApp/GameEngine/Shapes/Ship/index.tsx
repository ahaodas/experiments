import React from 'react'
import styles from './Ship.module.less'
import cn from 'classnames'

const Part: React.FC<{ className: string }> = ({ className }) => (
    <div className={cn(styles.part, className)}>
        <div className={cn(styles.side, styles.sbc)}></div>
        <div className={cn(styles.side, styles.sf)}></div>
        <div className={cn(styles.side, styles.sl)}></div>
        <div className={cn(styles.side, styles.sr)}></div>
        <div className={cn(styles.side, styles.st)}></div>
        <div className={cn(styles.side, styles.sb)}></div>
    </div>
)
const Ship = () => (
    <div className={styles.root} id={'ship'}>
        <Part className={styles.leftWing} />
        <Part className={styles.rightWing} />
        <Part className={styles.body} />
    </div>
)

export default Ship
