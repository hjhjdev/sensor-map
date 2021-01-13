import Vue from 'vue'
import Vuex from 'vuex'

import user from './user'
import sensor from './sensor'
import device from './device'
import map from './map'
import log from './log'
import alert from './alert'
import role from './role'
import snackbar from './snackbar'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    sensor,
    device,
    map,
    log,
    alert,
    role,
    snackbar
  }
})
