// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './style.css'
import * as Echarts from 'echarts'//这是echart5之后的引入方式
// import $ from jquery
Vue.use(ElementUI);

Vue.config.productionTip = false
Vue.prototype.$echarts = Echarts
// Vue.prototype.$ = jquery
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
