import {defineConfig, type DefaultTheme} from "vitepress";

export default defineConfig({
    title: '一个大不liu',
    description: '个人博客',
    base: '/blog/',
    head: [
        ['link', {rel: 'icon', href: '/blog/logo.png'}],
    ],
    lastUpdated: true,
    themeConfig: {
        logo: {src: '/logo.png', width: 24, height: 24},
        nav: nav(),
        sidebar: {
            '/front-end/': {base: '/front-end/', items: sidebarFontEnd()},
            '/back-end/': {base: '/back-end/', items: sidebarBackEnd()},
            '/interview/': {base: '/interview/', items: sidebarInterview()},
        },
        socialLinks: [
            {icon: 'github', link: 'https://github.com/jiuer12138'}
        ],
        search: {
            provider: 'algolia',
            options: {
                appId: '1S1L5IHDXL',
                apiKey: 'af0040fba6951babb4ca9cc97210f199',
                indexName: 'jiuer12138blog',
            }
        },
    }
})

function nav(): DefaultTheme.NavItem[] {
    return [
        {
            text: '前端',
            activeMatch: '/front-end/',
            items: [
                {
                    text: 'Javascript',
                    link: '/front-end/javascript'
                },
                {
                    text: 'Vue',
                    link: '/front-end/vue'
                }
            ]
        },
        {
            text: '后端',
            activeMatch: '/back-end/',
            items: [
                {
                    text: 'Java',
                    link: '/back-end/java'
                }
            ]
        },
        {
            text: '面试题',
            link: '/interview/index',
            activeMatch: '/interview/'
        }
    ]
}

/**
 * 前端端侧边栏
 */
function sidebarFontEnd(): DefaultTheme.SidebarItem[] {
    return [
        ...getOtherPageLink('前端')
    ]
}

/**
 * 后端侧边栏
 */
function sidebarBackEnd(): DefaultTheme.SidebarItem[] {
    return [
        ...getOtherPageLink('后端')
    ]
}

/**
 * 面试题侧边栏
 */
function sidebarInterview(): DefaultTheme.SidebarItem[] {
    return [
        {
            text: '前端',
            collapsed: false,
            items: [
                {text: '基础面试题', link: 'basics'},
            ]
        },
        {
            text: '后端',
            collapsed: false,
            items: [
                {text: 'Class', link: 'class'},
            ]
        },
        {
            text: '日常杂记',
            collapsed: false,
            items: [
                {text: 'VitePress', link: 'vitePress'},
            ]
        },
        ...getOtherPageLink('面试题')
    ]
}

/**
 * 根据nav数组获取侧边栏底部跳转nav各页面的数组
 * @param arr
 * @param text
 */
function getOtherPageLink(text: string): DefaultTheme.SidebarItem[] {
    const arr = nav()
    return recursive(arr, text)
}

/**
 * 递归函数
 * @param arr
 * @param text
 */
function recursive(arr: DefaultTheme.SidebarItem[], text = ''): DefaultTheme.SidebarItem[] {
    const pages = []
    const others = arr.filter(item => item.text !== text)
    for (let i = 0; i < others.length; i++) {
        let keys = Object.keys(others[i])
        if (keys.includes('link')) {
            let urls = others[i].link!.split('/')
            let lastStr = urls[urls.length - 1]
            pages.push({
                text: others[i].text,
                base: others[i].link!.replace(lastStr, ''),
                link: lastStr
            })
        }
        if (keys.includes('items')) {
            pages.push(...recursive(others[i].items as DefaultTheme.SidebarItem[]))
        }
    }
    return pages
}
