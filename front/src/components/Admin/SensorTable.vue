<template>
  <v-card
    class="mx-auto"
    outlined
  >
    <v-card-title class="primary white--text">
      센서
      <v-spacer></v-spacer>
      <CreateSensor></CreateSensor>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="sensorList"
      :items-per-page="10"
      mobile-breakpoint="0"
      disable-sort
      class="elevation-1"
    >
      <template v-slot:[`item.isAnalog`]="{ item }">
        <v-simple-checkbox
          v-model="item.isAnalog"
          disabled
        ></v-simple-checkbox>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <EditSensor :sensor="item"></EditSensor>
        <DeleteSensor :sensor="item"></DeleteSensor>
      </template>
      <template v-slot:no-data>
        <p>No data</p>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import CreateSensor from './CreateSensor'
import EditSensor from './EditSensor'
import DeleteSensor from './DeleteSensor'

export default {
  components: {
    CreateSensor,
    EditSensor,
    DeleteSensor
  },
  data () {
    return {
      headers: [
        { text: '센서 ID', value: 'sensorId' , align: 'center' },
        { text: '센서명', value: 'name' , align: 'center' },
        { text: '4-20mA 센서', value: 'isAnalog' , align: 'center' },
        { text: '수정', value: 'actions' , align: 'center' },
      ]
    }
  },
  computed: {
    sensorList () {
      return this.$store.state.sensor.list
    }
  },
  mounted () {
    this.$store.dispatch('getSensorList')
  }
}
</script>