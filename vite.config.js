import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        userOptions: resolve(__dirname, 'userOptions.html'),
        logMood: resolve(__dirname, 'logMood.html'),
        createUser: resolve(__dirname, 'createUser.html'),
        displayMoods: resolve(__dirname, 'displayMoods.html'),
        moodGraph: resolve(__dirname, 'moodGraph.html'),
        userProfile: resolve(__dirname, 'userProfile.html')
        // Add more pages here if needed
      }
    }
  }
})