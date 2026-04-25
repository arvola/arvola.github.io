import { defineConfig } from 'vite'
import postcssNesting from "postcss-nested";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                flowers: resolve(__dirname, "flowers.html"),
            },
        },
    },
    css: {
        postcss: {
            plugins: [
                postcssNesting
            ],
        },
    },
})
