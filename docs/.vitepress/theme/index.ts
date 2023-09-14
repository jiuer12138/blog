import DefaultTheme from 'vitepress/theme'
import customLayout from './CustomLayout.vue'

export default {
    extends: DefaultTheme,
    enhanceApp({app}: any) {
        app.component('customLayout', customLayout)
    }
}
