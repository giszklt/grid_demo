import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from "axios";
Vue.prototype.$axios =axios
import VueEvents from 'vue-events'
Vue.use(ElementUI)
Vue.use(VueEvents)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
