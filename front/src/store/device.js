import Vue from 'vue'
import axios from 'axios'

const state = {
  list: []
}

const actions = {
  createDevice ({ commit }, device) {
    return axios.post(`${process.env.VUE_APP_API_URI}/devices`, device)
      .then(response => {
        commit('CREATE_DEVICE', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  getDeviceList ({ commit }) {
    return axios.get(`${process.env.VUE_APP_API_URI}/devices`)
      .then(r => r.data)
      .then(response => {
        commit('GET_DEVICE_LIST', response)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  editDevice ({ commit }, device) {
    return axios.patch(`${process.env.VUE_APP_API_URI}/devices/` + device.deviceId, device.data)
      .then(response => {
        commit('EDIT_DEVICE', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  emptyDeviceList ({ commit }) {
    commit('EMPTY_DEVICE_LIST')
  },
  deleteDevice ({ commit }, deviceId) {
    return axios.delete(`${process.env.VUE_APP_API_URI}/devices/` + deviceId)
      .then(() => {
        commit('DELETE_DEVICE', deviceId)
      }, error => {
        console.log('shit! ', error)
        return Promise.reject(error.response)
      })
  }
}

const mutations = {
  CREATE_DEVICE (state, response) {
    state.list.push(response)
  },
  GET_DEVICE_LIST (state, response) {
    state.list = response
  },
  EMPTY_DEVICE_LIST (state) {
    state.list = []
  },
  DELETE_DEVICE (state, deviceId) {
    state.list.splice(
      state.list.findIndex((device) => device.deviceId === deviceId), 1)
  },
  EDIT_DEVICE (state, editedDevice) {
    let index = state.list.findIndex((device) => device.deviceId === editedDevice.deviceId, 1)
    // never, ever change array's value like below:
    // state.list[index] = editedDevice
    // to change value, use Vue.set
    Vue.set(state.list, index, editedDevice)
  }
}

export default {
  state,
  actions,
  mutations
}
