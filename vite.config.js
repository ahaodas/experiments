import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import path from 'path'

export default defineConfig({
    base: '/experiments/',
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
