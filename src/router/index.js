import {createRouter, creatreWebHistory} from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
    { path: '/', component: Home },
]

export default createRouter({
    history: creatreWebHistory(),
    routes,
})