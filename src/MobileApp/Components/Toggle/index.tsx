import React, { useCallback } from 'react'
import styles from './toggle.module.less'
interface Props {
    value: boolean
    onChange: (value: boolean) => void
    id: string
}
const Toggle: React.FC<Props> = ({ value, onChange, id }) => {
    const handleChange = useCallback(e => {
        onChange(e.target.checked)
    }, [])
    return (
        <>
            <input onChange={handleChange} className={styles.input} checked={value} id={id} type="checkbox" />
            <label className={styles.label} htmlFor={id}>
                <div className={styles.inner}></div>
            </label>
        </>
    )
}

export default Toggle
