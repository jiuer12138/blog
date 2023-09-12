import DefaultTheme from 'vitepress/theme'
import HomePage from './homePage.vue'

export default {
    extends: DefaultTheme,
    enhanceApp({app}:any) {
        app.component('homePage', HomePage)
    }
}
