import fragmentShader from './basic.frag'
import vertexShader from './basic.vert'
import { Color, MeshBasicMaterialParameters } from 'three'
import { shaderMaterial } from '@react-three/drei'
import { extend, Object3DNode } from '@react-three/fiber'
import React from 'react'
import { TwoPassDoubleSide } from 'three'

const defaultProps = {
    green: 0,
    red: 0,
    blue: 0,
    color: new Color('red'),
    time: 0,
}

export type MaterialProps = Partial<typeof defaultProps> & MeshBasicMaterialParameters

const uniforms = Object.entries(defaultProps).reduce((acc, [key, value]) => {
    acc[key] = { value }
    return acc
}, {})
const MaterialX = shaderMaterial(uniforms, vertexShader, fragmentShader)

declare module '@react-three/fiber' {
    interface ThreeElements {
        materialX: Object3DNode<MaterialProps, typeof MaterialX>
    }
}
extend({ MaterialX })
const Element = React.forwardRef((props: MaterialProps, ref) => {
    return <materialX {...props} ref={ref} />
})
export default Element
