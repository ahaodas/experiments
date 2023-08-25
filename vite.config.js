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
            '@game-view': path.resolve(__dirname, './src/GameView'),
            '@remote-controller': path.resolve(__dirname, './src/RemoteController'),
            utils: path.resolve(__dirname, './src/utils'),
        },
    },
})
