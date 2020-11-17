import Vue from 'vue'
import Vuex, { mapActions, mapGetters } from 'vuex'
import VueRouter from 'vue-router'
import createPersistedState from 'vuex-persistedstate'
import router from './router/main'
import session from './store/session'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.css'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import 'remixicon/fonts/remixicon.css'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import 'typeface-inter'
import FrameControls from './components/FrameControls.vue'

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(BootstrapVue)
Vue.use(IconsPlugin)

const store = new Vuex.Store({
  modules: { session },
  plugins: [createPersistedState()]
})

const components = { FrameControls }
new Vue({
  el: '#app',
  components,
  router,
  store,
  computed: {
    ...mapGetters(['getSession'])
  },
  mounted () {
    window.setInterval(function () {
      const sessionLockTimeout = window.setTimeout(this.destroySession, 300000)
      window.addEventListener('click keypress mousemove', function () {
        window.clearTimeout(sessionLockTimeout)
      }, true)
    }, 300001)
  },
  methods: {
    ...mapActions(['destroySession'])
  }
})
