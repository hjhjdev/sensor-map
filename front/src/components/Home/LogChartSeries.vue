<template>
  <v-row v-if="!visible" no-gutters class="flex-column pa-2 fill-height">
    <v-col cols="12">
      <v-alert type="info">
        지도의 마커를 선택해 실시간 정보를 불러옵니다.
      </v-alert>
    </v-col>
  </v-row>
  <v-row v-else no-gutters class="flex-row pa-2 fill-height">
    <v-col cols="12">
      <DeviceInfo></DeviceInfo>
    </v-col>
    <v-col cols="12">
      <v-card width="100%" class="mt-2">
        <v-card-title :class="['text-subtitle-1', 'pa-2', 'px-4', `${cardColorCheck}`]" :style="{ background: `${analogColor}` }">
          <span class="text-subtitle-1">{{ analogSensorName }} [{{ measureMode }}] {{ analAverageValue }}</span>
          <v-spacer></v-spacer>
          <span class="text-subtitle-1">실시간: {{ analLastValue }}</span>
        </v-card-title>
        <v-card-text class="pa-2">
          <LogChart
            chartName="analChart"
            :chartData="analChart.data"
            :options="analChart.options"
            class="chart"
          />
        </v-card-text>
      </v-card>
      <v-card width="100%" class="mt-2">
        <v-card-title class="text-subtitle-1 pa-2 px-4 secondary white--text">
          <span>{{ sensorOneName }}</span>
          <v-spacer></v-spacer>
          <span class="text-subtitle-1 pl-1">실시간: {{ tempLastValue }}</span>
        </v-card-title>
        <v-card-text class="pa-2">
          <LogChart
            chartName="tempChart"
            :chartData="tempChart.data"
            :options="tempChart.options"
            class="chart"
          />
        </v-card-text>
      </v-card>
      <v-card width="100%" class="mt-2">
        <v-card-title class="text-subtitle-1 pa-2 pl-4 secondary white--text">
          <span>{{ sensorTwoName }}</span>
          <v-spacer></v-spacer>
          <span class="text-subtitle-1 pl-1">실시간: {{ humiLastValue }}</span>
        </v-card-title>
        <v-card-text class="pa-2">
          <LogChart
            chartName="humiChart"
            :chartData="humiChart.data"
            :options="humiChart.options"
            class="chart"
          />
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import LogChart from './LogChart'
import DeviceInfo from './DeviceInfo'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    LogChart,
    DeviceInfo
  },
  data: function() {
    return {
      lastDeviceId: ''
    }
  },
  mounted () {
    this.$store.dispatch('getSensorList')
  },
  watch: {
    markerInfoDeviceId: function (deviceId) {
      if (this.visible) {
        // check first click
        if (this.lastDeviceId === '') {
          this.lastDeviceId = deviceId;
          this.updateChart()
          .then(() => {
            this.$store.dispatch('connectLogSocket', deviceId);
          }).then(() => {
            this.$store.state.log.io.on('newData', (data) => {
              this.$store.dispatch('updateChartPartial', data);
            });
          });
        } else {
          // check another device clicked
          if (this.lastDeviceId != deviceId) {
            this.$store.dispatch('disconnectLogSocket')
            .then(() => {
              this.lastDeviceId = deviceId;
              this.updateChart()
            }).then(() => {
              this.$store.dispatch('connectLogSocket', deviceId)
            }).then(() => {
              this.$store.state.log.io.on('newData', (data) => {
                this.$store.dispatch('updateChartPartial', data);
              });
            });
          }
        }
      }
    }
  },
  computed: {
    ...mapState({
      visible: state => state.map.markerInfoVisible,
      analChart: state => state.log.analChart,
      tempChart: state => state.log.tempChart,
      humiChart: state => state.log.humiChart,
      analogColor: state => state.log.analChart.cardColor
    }),
    ...mapGetters([
      'tempLastValue',
      'humiLastValue',
      'analLastValue',
      'analAverageValue'
    ]),
    measureMode () {
      switch (this.selectedDevice.measureMode) {
        case 'CE':
          return 'CEILING';
        case 'ST':
          return 'STEL';
        case 'TW':
          return 'TWA';
      }
    },
    cardColorCheck () {
      if (this.analogColor === 'yellow' || this.analColor === 'grey')
        return 'black--text'
      else
        return 'white--text'
    },
    // device
    selectedDevice () {
      let index = this.$store.state.device.list.findIndex((device) => device.deviceId === this.$store.state.map.markerInfoDeviceId, 1)
      return this.$store.state.device.list[index]
    },
    sensorOneName () {
      let index = this.$store.state.sensor.list.findIndex((sensor) => sensor.sensorId === this.selectedDevice.sensorOneId)
      return this.$store.state.sensor.list[index].name
    },
    sensorTwoName () {
      let index = this.$store.state.sensor.list.findIndex((sensor) => sensor.sensorId === this.selectedDevice.sensorTwoId)
      return this.$store.state.sensor.list[index].name
    },
    analogSensorName () {
      let index = this.$store.state.sensor.list.findIndex((sensor) => sensor.sensorId === this.selectedDevice.sensorThreeId)
      return this.$store.state.sensor.list[index].name
    },
    markerInfoDeviceId () {
      return this.$store.state.map.markerInfoDeviceId
    },
  },
  methods: {
    async updateChart () {
      // update chart with selected device's deviceId
      await this.$store.dispatch('updateChart', {
        deviceId: this.selectedDevice.deviceId
      })
    }
  },
  destroyed () {
    // stop update when visiting another page or in v-if statement
    this.$store.dispatch('disconnectLogSocket')
    this.$store.dispatch('emptyChart');
    this.$store.dispatch('disableMarkerInfoVisible');
  }
}
</script>

<style scoped>
  .chart {
    height: 200px;
  }
</style>