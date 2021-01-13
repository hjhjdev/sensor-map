import axios from 'axios'
import io from 'socket.io-client';

const state = {
  io: null,
  main: {
    drawer: false,
    list: [],
    totalItems: 0
  },
  sub: {
    list: [],
    totalItems: 0
  }
}

const actions = {
  toggleMainAlertBar ({ commit }) {
    commit('TOGGLE_MAIN_ALERT_BAR')
  },
  connectAlertSocket ({ commit }, userId) {
    commit('CONNECT_ALERT_SOCKET', userId)
  },
  disconnectAlertSocket ({ commit }) {
    commit('DISCONNECT_ALERT_SOCKET')
  },
  updateAlertList ({ commit }, data) {
    commit('UPDATE_ALERT_LIST', data)
  },
  getAlertList ({ commit }, option) {
    return axios.get(`${process.env.VUE_APP_API_URI}/logs/alerts`, { params: option })
      .then(response => {
        commit('GET_ALERT_LIST', response.data)
      })
  },
  getSubAlertList ({ commit }, option) {
    return axios.get(`${process.env.VUE_APP_API_URI}/logs`, { params: option })
      .then(response => {
        commit('GET_SUB_ALERT_LIST', response.data)
      })
  },
  emptyAlertList ({ commit }) {
    commit('EMPTY_ALERT_LIST')
  },
  emptySubAlertList ({ commit }) {
    commit('EMPTY_SUB_ALERT_LIST')
  }
}

const mutations = {
  TOGGLE_MAIN_ALERT_BAR(state) {
    state.main.drawer = !state.main.drawer;
  },
  CONNECT_ALERT_SOCKET(state, userId) {
    state.io = io(
      `${process.env.VUE_APP_STREAM_URI}/alert`, {
        query: {
          userId: userId
        },
        transports: ['websocket']
      }
    );
  },
  DISCONNECT_ALERT_SOCKET(state) {
    state.io.disconnect();
    state.io = null;
  },
  UPDATE_ALERT_LIST(state, data) {
    let tempList = state.main.list.slice();
    tempList.unshift(data);

    state.main.list = Object.freeze(tempList);
  },
  GET_ALERT_LIST (state, response) {
    state.main.list = Object.freeze(response.data)
    state.main.totalItems = response.count
  },
  GET_SUB_ALERT_LIST (state, response) {
    state.sub.list = Object.freeze(response.rows)
    state.sub.totalItems = response.count
  },
  EMPTY_ALERT_LIST (state) {
    state.main.list = [];
  },
  EMPTY_SUB_ALERT_LIST (state) {
    state.sub.list = []
    state.sub.totalItems = 0;
  }
}

const getters = {
  mainDrawer (state) {
    return state.main.drawer;
  },
  mainAlertList (state) {
    return state.main.list;
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
