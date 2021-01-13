import Vue from 'vue'
import axios from 'axios'

const state = {
  list: []
}

const actions = {
  createRole ({ commit }, role) {
    return axios.post(`${process.env.VUE_APP_API_URI}/roles`, role)
      .then(response => {
        // doesn't have to commit
        // because component always requests getRoleList when render
        commit('CREATE_ROLE', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  getRoleList ({ commit }, userId) {
    return axios.get(`${process.env.VUE_APP_API_URI}/roles/users/` + userId)
      .then(r => r.data)
      .then(response => {
        commit('GET_ROLE_LIST', response)
      })
  },
  editRole ({ commit }, role) {
    return axios.patch(`${process.env.VUE_APP_API_URI}/roles/` + role.roleId, role.data)
      .then(response => {
        response.data.roleId = role.roleId;
        commit('EDIT_ROLE', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  deleteRole ({ commit }, role) {
    return axios.delete(`${process.env.VUE_APP_API_URI}/roles/` + role.roleId)
      .then(() => {
        commit('DELETE_ROLE', role.roleId)
      } , error => {
        return Promise.reject(error.response)
      })
  },
  emptyRoleList ({ commit }) {
    commit('EMPTY_ROLE_LIST')
  }
}

const mutations = {
  CREATE_ROLE (state, response) {
    state.list.push(response)
  },
  GET_ROLE_LIST (state, response) {
    state.list = response
  },
  DELETE_ROLE (state, roleId) {
    state.list.splice(
      state.list.findIndex((i) => i.roleId === roleId), 1)
  },
  EDIT_ROLE (state, edited) {
    let index = state.list.findIndex((i) => i.roleId === edited.roleId, 1)
    // never, ever change array's value like below:
    // state.list[index] = editedDevice
    // to change value, use Vue.set
    Vue.set(state.list, index, editedRole)
  },
  EMPTY_ROLE_LIST (state) {
    state.list = []
  },
}

export default {
  state,
  actions,
  mutations
}
