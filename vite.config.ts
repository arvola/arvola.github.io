import { defineConfig } from 'vite'
import postcssNesting from "postcss-nested";

export default defineConfig({
    css: {
        postcss: {
            plugins: [
                postcssNesting
            ],
        },
    },
})
