import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import vuetify from './plugins/vuetify.js'
import router from './router/index.js'
import './styles/legacy.css'
import './styles/overrides.css'
import App from './App.vue'

createApp(App).use(vuetify).use(router).mount('#app')
