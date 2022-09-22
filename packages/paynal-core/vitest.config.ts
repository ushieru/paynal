import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        deps: {
            inline: true,
            fallbackCJS: true,
        }
    },
})