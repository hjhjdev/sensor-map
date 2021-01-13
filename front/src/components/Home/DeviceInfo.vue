<template>
  <v-card class="primary">
    <v-card-title class="text-h6 py-2 px-4 mx-2 white--text">
      <div>{{ selectedDevice.name }} - {{ selectedDevice.companyName }}</div>
      <v-spacer></v-spacer>
      <EditDevice :device="selectedDevice"/>
      <DeleteDevice :device="selectedDevice"/>
    </v-card-title>
    <v-card-text class="pa-0">
      <v-row class="pa-0 pb-4 d-flex justify-center" no-gutters>
        <v-chip
          v-for="item in deviceInfo"
          v-bind:key="item.text"
          class="ma-1"
          color="white"
          outlined
          small
        >
          <v-icon left>
            {{ item.icon }}
          </v-icon>
          {{ item.text }}
        </v-chip>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import DeleteDevice from './DeleteDevice'
import EditDevice from './EditDevice'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    DeleteDevice,
    EditDevice
  },
  computed: {
    // device
    selectedDevice () {
      let index = this.$store.state.device.list.findIndex((device) => device.deviceId === this.$store.state.map.markerInfoDeviceId, 1)
      return this.$store.state.device.list[index]
    },
    deviceInfo () {
      return [
        {
          icon: 'mdi-devices',
          text: this.selectedDevice.macAddress
        },
        {
          icon: 'mdi-account',
          text: this.selectedDevice.chargeName
        },
        {
          icon: 'mdi-phone',
          text: this.selectedDevice.chargePhone
        },
        {
          icon: 'mdi-hand-okay',
          text: this.selectedDevice.analogNormal
        },
        {
          icon: 'mdi-alert-circle',
          text: this.selectedDevice.analogWarning
        },
        {
          icon: 'mdi-alert-octagon',
          text: this.selectedDevice.analogDanger
        },
        {
          icon: 'mdi-alert-octagram',
          text: this.selectedDevice.analogOutlier
        },
      ]
    }
  }
}
</script>