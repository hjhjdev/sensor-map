const state = {
  isVisible: false,
  text: '',
  color: 'red'
}

const actions = {
  setSnackBarVisible ({ commit }, value) {
    commit('SET_SNACKBAR_VISIBLE', value);
  },
  setSnackBar ({ commit }, { text, color }) {
    commit('SET_SNACKBAR', { text, color});
  }
}

const mutations = {
  SET_SNACKBAR_VISIBLE (state, value) {
    state.isVisible = value;
  },
  SET_SNACKBAR (state, { text, color }) {
    state.color = color;
    state.text = text;
    state.isVisible = true;
  }
}

export default {
  state,
  actions,
  mutations
}
