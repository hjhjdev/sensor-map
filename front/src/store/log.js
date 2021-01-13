import Vue from 'vue'
import axios from 'axios'
import io from 'socket.io-client';
import  { parseISO, differenceInSeconds } from 'date-fns';

const state = {
  io: null,
  lastentries: [],
  drawer: false,
  chartNames: ['temp', 'humi', 'anal'],
  names: ['온도', '습도', '아날로그'],
  // charts
  tempChart: {
    data: {
      measureModeValue: [],
      createdAt: [],
      sensorId: '',
      labels: [],
      datasets: [{
        label: '온도',
        data: []
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
            tension: 0 // disables bezier curves
        }
      },
      legend: {
        display: false
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'second',
            unitStepSize: 30,
            tooltipFormat: 'MM-DD HH:mm:ss',
            displayFormats: {
              second: 'HH:mm:ss'
            }
          }
        }] 
      }
    }
  },
  humiChart: {
    data: {
      measureModeValue: [],
      createdAt: [],
      sensorId: '',
      labels: [],
      datasets: [{
        label: '습도',
        data: []
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
            tension: 0 // disables bezier curves
        }
      },
      legend: {
        display: false
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'second',
            unitStepSize: 30,
            tooltipFormat: 'MM-DD HH:mm:ss',
            displayFormats: {
              'second': 'HH:mm:ss'
            }
          }
        }] 
      }
    }
  },
  analChart: {
    cardColor: 'grey',
    data: {
      measureModeValue: [],
      createdAt: [],
      sensorId: '',
      average: [],
      labels: [],
      datasets: [{
        label: '아날로그',
        data: []
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: {
        line: {
            tension: 0 // disables bezier curves
        }
      },
      legend: {
        display: false
      },
      animation: {
        duration: 0 // general animation time
      },
      hover: {
        animationDuration: 0 // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'second',
            unitStepSize: 30,
            tooltipFormat: 'MM-DD HH:mm:ss',
            displayFormats: {
              'second': 'HH:mm:ss'
            }
          }
        }] 
      }
    }
  }
}

const getters = {
  tempLastValue (state) {
    let length = state.tempChart.data.datasets[0].data.length;
    if (length != 0) {
      return Number.parseFloat(state.tempChart.data.datasets[0].data[length - 1]).toFixed(3);
    } else {
      return -999;
    }
  },
  humiLastValue (state) {
    let length = state.humiChart.data.datasets[0].data.length;
    if (length != 0) {
      return Number.parseFloat(state.humiChart.data.datasets[0].data[length - 1]).toFixed(3);
    } else {
      return -999;
    }
  },
  analLastValue (state) {
    let length = state.analChart.data.datasets[0].data.length;
    if (length != 0) {
      return Number.parseFloat(state.analChart.data.datasets[0].data[length - 1]).toFixed(3);
    } else {
      return -999;
    }
  },
  analAverageValue (state) {
    let length = state.analChart.data.datasets[0].data.length
    if (length != 0) {
      return Number.parseFloat(state.analChart.data.measureModeValue[length - 1]).toFixed(3);
    } else {
      return -999;
    }
  }
}

const actions = {
  toggleMainToolBar({ commit }) {
    commit('TOGGLE_MAIN_TOOLBAR');
  },
  connectLogSocket({ commit }, deviceId) {
    commit('CONNECT_LOG_SOCKET', deviceId)
  },
  disconnectLogSocket ({ commit }) {
    commit('DISCONNECT_LOG_SOCKET')
  },
  updateLastEntries ({ commit }) {
    return axios.get(`${process.env.VUE_APP_API_URI}/logs/lastentry/`)
      .then(response => {
        commit('UPDATE_LAST_ENTRIES', { data: response.data })
      }, error => {
        return Promise.reject(error.response)
      })
  },
  updateChartPartial ({ commit, }, data) {
    commit('UPDATE_CHART_PARTIAL', data)
  },
  updateChart ({ commit }, data) {
    return axios.get(`${process.env.VUE_APP_API_URI}/logs/device/` + data.deviceId)
      .then(response => {
        commit('UPDATE_CHART', { data: response.data })
      }, error => {
        return Promise.reject(error.response)
      })
  },
  emptyChart ({ commit }) {
    commit('EMPTY_CHART')
  }
}

const mutations = {
  TOGGLE_MAIN_TOOLBAR(state) {
    state.drawer = !state.drawer;
  },
  CONNECT_LOG_SOCKET(state, deviceId) {
    state.io = io(
      `${process.env.VUE_APP_STREAM_URI}/log`, {
        query: {
          deviceId: deviceId
        },
        transports: ['websocket']
      }
    );
  },
  // check io null because user could visit another page without connecting
  DISCONNECT_LOG_SOCKET(state) {
    if (state.io !== null) {
      state.io.disconnect();
      state.io = null;
    }
  },
  UPDATE_LAST_ENTRIES(state, payload) {
    state.lastentries = payload.data;
  },
  UPDATE_CHART_PARTIAL(state, data) {
    // find chart based on sensorId
    let search = [state.tempChart, state.humiChart, state.analChart];
    let result = search.find(x => x.data.sensorId === data.sensorId);

    // limit chart start point to last 130 seconds
    if (result.data.datasets[0] !== undefined) {
      // find outdated point index
      let outdatedIndex = result.data.createdAt.findIndex(item => 
        differenceInSeconds(parseISO(data.createdAt), parseISO(item)) < 130);
      // if not found, index will be -1
      // then pass splice and push data
      if (outdatedIndex > 0) {
        result.data.createdAt.splice(0, outdatedIndex);
        result.data.measureModeValue.splice(0, outdatedIndex);
        result.data.labels.splice(0, outdatedIndex);
        result.data.datasets[0].data.splice(0, outdatedIndex);
      }
    } 
    // push new value
    result.data.createdAt.push(data.createdAt);
    result.data.measureModeValue.push(data.measureModeValue);
    result.data.labels.push(data.labels);
    result.data.datasets[0].data.push(data.data);

    // check analog sensor chart and update color
    if (data.isAnalog) {
      switch (data.measureModeWarnLevel) {
        case 0:
          state.analChart.cardColor = 'green';
          break;
        case 1:
          state.analChart.cardColor = 'yellow';
          break;
        case 2:
          state.analChart.cardColor = 'red';
          break;
        case 3:
          state.analChart.cardColor = 'red';
          break;
        default:
          state.analChart.cardColor = 'grey';
      }
    }

    // early memory return
    search = null;
    result = null;
  },
  UPDATE_CHART(state, payload) {
    for (let i = 0; i < 3; i++) {
      Vue.set(state[state.chartNames[i] + 'Chart'], 'data', {
        sensorId: payload.data[i].sensorId,
        measureModeValue: payload.data[i].measureModeValue,
        createdAt: payload.data[i].createdAt,
        labels: payload.data[i].labels,
        datasets: [{
          backgroundColor: '#FFFFFF',
          borderColor: '#8fafc9',
          borderWidth: 2,
          pointRadius: 2,
          fill: false,
          label: state.names[i],
          data: payload.data[i].data
        }]
      })
    }
  },
  EMPTY_CHART (state) {
    for (let i = 0; i < 3; i++) {
      state[state.chartNames[i] + 'Chart'].data = {
        sensorId: '',
        measureModeValue: [],
        labels: [],
        datasets: [{
          fill: false,
          label: state.names[i],
          data: []
        }]
      }
    }
  }
}

export default {
  state,
  actions,
  mutations,
  getters
}
