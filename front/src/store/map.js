import io from 'socket.io-client';

const state = {
  io: null,
  context: null,
  markers: [],
  markerInfoDeviceId: '',
  markerInfoVisible: false,
  normalImage: require('@/assets/marker-green.png'),
  warningImage: require('@/assets/marker-yellow.png'),
  dangerImage: require('@/assets/marker-red.png'),
  nullImage: require('@/assets/marker-grey.png'),
  warnLevel: null,
  markerIndex: null,
  tempImage: null,
  image: null
}

const actions = {
  connectMapSocket({ commit }, userId) {
    commit('CONNECT_MAP_SOCKET', userId)
  },
  disconnectMapSocket({ commit }, userId) {
    commit('DISCONNECT_MAP_SOCKET', userId)
  },
  loadMap({ commit }, data) {
    commit('LOAD_MAP', data);
  },
  unloadMap({ commit }, data) {
    commit('UNLOAD_MAP', data);
  },
  relayoutMap({ commit }) {
    commit('RELAYOUT_MAP');
  },
  reloadMarker({ commit }) {
    commit('RELOAD_MARKER')
  },
  addMarker({ state, commit }, data) {
    commit('ADD_MARKER', data);
    // add listener
    kakao.maps.event.addListener(state.markers[state.markers.length - 1], 'click', function () {
      commit('SET_MARKER_INFO_DEVICE_ID', data.deviceId);
    });
  },
  editMarkerColor({ commit }, data) {
    commit('EDIT_MARKER_COLOR', data);
  },
  deleteMarker({ commit }, deviceId) {
    commit('DELETE_MARKER', deviceId)
  },
  emptyMarkerList({ commit }) {
    commit('EMPTY_MARKER_LIST')
  },
  setMarkerInfoDeviceId({ commit}, deviceId) {
    commit('SET_MARKER_INFO_DEVICE_ID', deviceId)
  },
  disableMarkerInfoVisible ({ commit }) {
    commit('DISABLE_MARKER_INFO_VISIBLE')
  }
}

const mutations = {
  CONNECT_MAP_SOCKET(state, userId) {
    state.io = io(
      `${process.env.VUE_APP_STREAM_URI}/map`, {
        query: {
          userId: userId
        },
        transports: ['websocket']
      }
    );
  },
  DISCONNECT_MAP_SOCKET(state) {
    state.io.disconnect();
    state.io = null;
  },
  LOAD_MAP(state, data) {
    state.context = new kakao.maps.Map(data.container, data.options);
  },
  UNLOAD_MAP(state, data) {
    state.context = null;
  },
  RELAYOUT_MAP(state) {
    state.context.relayout();
  },
  RELOAD_MARKER(state) {
    state.context
  },
  ADD_MARKER(state, data) {
    // default marker
    let imageSize = new kakao.maps.Size(58, 84), // 마커이미지의 크기입니다
        imageOption = {offset: new kakao.maps.Point(29, 84)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.     
    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    let markerImage = new kakao.maps.MarkerImage(state.nullImage, imageSize, imageOption);
    // create marker
    let marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(data.latitude, data.longitude),
        image: markerImage
    });
    // show marker
    marker.setMap(state.context);
    // add deviceId property to marker
    marker.deviceId = data.deviceId;
    // push to list
    state.markers.push(marker);
  },
  EDIT_MARKER_COLOR(state, data) {
    state.warnLevel = parseInt(data.measureModeWarnLevel);
    switch (state.warnLevel) {
      case 0:
        state.image = state.normalImage;
        break;
      case 1:
        state.image = state.warningImage;
        break;
      case 2:
        state.image = state.dangerImage;
        break;
      case 3:
        state.image = state.dangerImage;
        break;
      default: 
        state.image = state.nullImage;
    }

    state.tempImage = new kakao.maps.MarkerImage(
      state.image,
      new kakao.maps.Size(58, 84), new kakao.maps.Point(29, 84)
    );
    
    state.markerIndex = state.markers.findIndex(x => x.deviceId === data.deviceId);
    state.markers[state.markerIndex].setImage(state.tempImage);

    // resource management
    state.warnLevel = null;
    state.markerIndex = null;
    state.image = null;
    state.tempImage = null;
  },
  DELETE_MARKER(state, deviceId) {
    // delete marker by deviceId
    let index = state.markers.findIndex((item) => 
      item.deviceId === deviceId)
    // disable and remove marker from map
    state.markers[index].setMap(null);
    state.markers.splice(index, 1);
  },
  EMPTY_MARKER_LIST(state) {
    for (let i = 0; i < state.markers.length; i++) {
      state.markers[i].setMap(null);
    }
    state.markers = []
  },
  SET_MARKER_INFO_DEVICE_ID (state, deviceId) {
    state.markerInfoDeviceId = deviceId
    state.markerInfoVisible = true
  },
  DISABLE_MARKER_INFO_VISIBLE (state) {
    state.markerInfoDeviceId = null
    state.markerInfoVisible = false
  }
}

export default {
  state,
  actions,
  mutations
}
