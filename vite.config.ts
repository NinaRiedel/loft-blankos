import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
    server: {allowedHosts: ['.ngrok-free.app']},
    base: '/loft-blankos/',
    plugins: [react()],
});
