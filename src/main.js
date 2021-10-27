import Vue from 'vue'
import App from './App.vue'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
Vue.config.productionTip = false

import Vue2TouchEvents from 'vue2-touch-events'

Vue.use(Vue2TouchEvents)

// Vue.use(Paintable, {
//   // optional methods
//   setItem(key, image) {
//     localStorage.setItem(key, image);
   
//   },
//   // you also can use async
//   getItem(key) {
//     return localStorage.getItem(key);
//   },
//   removeItem(key) {
//     localStorage.removeItem(key);
//   }
// });
new Vue({

  render: h => h(App),
}).$mount('#app')
