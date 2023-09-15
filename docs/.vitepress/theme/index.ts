import DefaultTheme from 'vitepress/theme'
import MyLayout from "./myLayout.vue";

export default {
    extends: DefaultTheme,
    enhanceApp(ctx:any) {
        ctx.app.component('myLayout', MyLayout)
    }
}
