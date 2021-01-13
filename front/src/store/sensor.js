import Vue from 'vue'
import axios from 'axios'

const state = {
  list: [],
}

const actions = {
  createSensor ({ commit }, sensor) {
    return axios.post(`${process.env.VUE_APP_API_URI}/sensors`, sensor)
      .then(response => {
        commit('CREATE_SENSOR', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  getSensorList ({ commit }) {
    return axios.get(`${process.env.VUE_APP_API_URI}/sensors`)
      .then(r => r.data)
      .then(response => {
        commit('GET_SENSOR_LIST', response)
      })
  },
  editSensor ({ commit }, sensor) {
    return axios.patch(`${process.env.VUE_APP_API_URI}/sensors/` + sensor.sensorId, sensor.data)
      .then((response) => {
        response.data.sensorId = sensor.sensorId;
        commit('EDIT_SENSOR', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  emptySensorList ({ commit }) {
    commit('EMPTY_SENSOR_LIST')
  },
  deleteSensor ({ commit }, sensorId) {
    return axios.delete(`${process.env.VUE_APP_API_URI}/sensors/` + sensorId)
      .then(() => {
        commit('DELETE_SENSOR', sensorId)
      }, error => {
        return Promise.reject(error.response)
      })
  }
}

const mutations = {
  CREATE_SENSOR (state, response) {
    state.list.push(response)
  },
  GET_SENSOR_LIST (state, response) {
    state.list = response
  },
  EMPTY_SENSOR_LIST (state) {
    state.list = []
  },
  DELETE_SENSOR (state, sensorId) {
    state.list.splice(
      state.list.findIndex((sensor) => sensor.sensorId === sensorId), 1)
  },
  EDIT_SENSOR (state, editedSensor) {
    let index = state.list.findIndex((sensor) => sensor.sensorId === editedSensor.sensorId)
    // never, ever change array's value like below:
    // state.userList[index] = editedUser
    // to change value, use Vue.set
    Vue.set(state.list, index, editedSensor)
  }
}

export default {
  state,
  actions,
  mutations
}
