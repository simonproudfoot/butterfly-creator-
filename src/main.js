import Vue from 'vue'
import App from './App.vue'
import Paintable from 'vue-paintable';
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
Vue.config.productionTip = false



Vue.use(Paintable, {
  // optional methods
  setItem(key, image) {
    localStorage.setItem(key, image);
   
  },
  // you also can use async
  getItem(key) {
    return localStorage.getItem(key);
  },
  removeItem(key) {
    localStorage.removeItem(key);
  }
});
new Vue({

  render: h => h(App),
}).$mount('#app')
