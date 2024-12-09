import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'




import * as vuetify from 'vite-plugin-vuetify'

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [vue(),
    vuetify.default({ autoImport: true}),
    {
      name: 'html-inject-data',
      enforce: 'post',
      transformIndexHtml(html) {
        const regex = /<(style|script|link) (.*)>/gi;
        const replacer = (_, p1, p2) => {
          // add nonce?
          if (
            p1 === 'script'
          ) {
            if(!p2.match(/integrity="/)){
              p2 = `integrity="CSP_MAIN_TS_HASH" ${p2}`;
            }
          }

          return `<${p1} ${p2}>`;
        };

        return html.replace(regex, replacer);
      },
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '$': fileURLToPath(new URL('./', import.meta.url)),
    }
  },
  define: {
    __INTLIFY_JIT_COMPILATION__: true
  }
})
