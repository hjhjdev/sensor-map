const state = {
  isVisible: false,
  color: '',
  text: ''
}

const actions = {
  // ALERT
  showNotification ({ commit }, param) {
    commit('SHOW_NOTIFICATION', param)
  }
}

const mutations = {
  SHOW_NOTIFICATION (state, param) {
    state.alert.isVisible = param.isVisible;
    state.alert.text = param.text;
    state.alert.color = param.color;
  }
}

export default {
  state,
  actions,
  mutations
}
