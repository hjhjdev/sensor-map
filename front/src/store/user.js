import Vue from 'vue'
import axios from 'axios'
import VueCookies from 'vue-cookies'
import decode from 'jwt-decode'

const state = {
  userInfo: {},
  list: [],
}

const actions = {
  getUserInfoFromCookie ({ commit }) {
    commit('GET_USER_INFO_FROM_COOKIE')
  },
  createUser ({ commit }, user) {
    return axios.post(`${process.env.VUE_APP_API_URI}/users`, user)
      .then(response => {
        commit('CREATE_USER', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  getUserList ({ commit }) {
    return axios.get(`${process.env.VUE_APP_API_URI}/users`)
      .then(r => r.data)
      .then(response => {
        commit('GET_USER_LIST', response)
      })
  },
  editUser ({ commit }, user) {
    return axios.patch(`${process.env.VUE_APP_API_URI}/users/` + user.userId, user.data)
      .then(response => {
        response.data.userId = user.userId;
        commit('EDIT_USER', response.data)
      }, error => {
        return Promise.reject(error.response)
      })
  },
  emptyUserList ({ commit }) {
    commit('EMPTY_USER_LIST')
  },
  deleteUser ({ commit }, userId) {
    return axios.delete(`${process.env.VUE_APP_API_URI}/users/` + userId)
      .then(() => {
        commit('DELETE_USER', userId)
      }, error => {
        return Promise.reject(error.response)
      })
  }
}

const mutations = {
  GET_USER_INFO_FROM_COOKIE (state) {
    let cookie = VueCookies.get('user');
    
    if (cookie) {
      state.userInfo = decode(cookie);
    } else {
      state.userInfo = {
        isAdmin: false
      }
    }
  },
  CREATE_USER (state, response) {
    state.list.push(response)
  },
  GET_USER_LIST (state, response) {
    state.list = response
  },
  EMPTY_USER_LIST (state) {
    state.list = []
  },
  DELETE_USER (state, userId) {
    state.list.splice(
      state.list.findIndex((user) => user.userId === userId), 1)
  },
  EDIT_USER (state, editedUser) {
    let index = state.list.findIndex((user) => user.userId === editedUser.userId)
    // never, ever change array's value like below:
    // state.list[index] = editedUser
    // to change value, use Vue.set
    Vue.set(state.list, index, editedUser)
  }
}

export default {
  state,
  actions,
  mutations
}
