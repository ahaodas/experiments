import {defineConfig} from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import {BASE_URL} from './constants'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    base: `/${BASE_URL}/`,
    server: {
        https: true,
    },
    plugins: [basicSsl(), glsl()],
    resolve: {
        alias: {
            '@shaders': path.resolve(__dirname, './src/shaders'),
            '@mobile-app': path.resolve(__dirname, './src/MobileApp'),
            '@desktop-app': path.resolve(__dirname, './src/DesktopApp'),
            '@assets': path.resolve(__dirname, './src/assets'),
            components: path.resolve(__dirname, './src/components'),
            utils: path.resolve(__dirname, './src/utils'),
        },
    },
    cssModulesOptions: {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
})
