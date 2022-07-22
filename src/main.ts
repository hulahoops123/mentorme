import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import global from './global'
import './index.css'
const app =createApp(App);
app.use(router);
app.provide('global',{global})   //expects 2 arguments??
app.mount('#app');

