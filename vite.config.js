import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'
import { BASE_URL } from './constants'

export default defineConfig({
    base: `/${BASE_URL}/`,
    server: {
        https: true,
    },
    plugins: [basicSsl()],
    resolve: {
        alias: {
            '@mobile-app': path.resolve(__dirname, './src/MobileApp'),
            '@desktop-app': path.resolve(__dirname, './src/DesktopApp'),
            'components': path.resolve(__dirname, './src/components'),
            utils: path.resolve(__dirname, './src/utils'),
        },
    },
})
