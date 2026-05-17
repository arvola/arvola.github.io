import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import postcssNesting from "postcss-nested";

export default defineConfig({
    css: {
        postcss: {
            plugins: [
                postcssNesting
            ],
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                flowers: resolve(__dirname, 'flowers.html'),
                test: resolve(__dirname, 'test.html'),
                primitiveShape: resolve(__dirname, 'primitive-shape.html'),
            },
        },
    },
})
