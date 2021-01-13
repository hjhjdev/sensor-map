<template>
  <v-row no-gutters style="height:100%" class="flex-column">
    <v-col class="overflow-y-auto">
      <LogChartSeries class="ma-0"/>
    </v-col>
  </v-row>
</template>

<script>
import LogChartSeries from './LogChartSeries'
import CreateDevice from './CreateDevice'

export default {
  components: {
    LogChartSeries,
    CreateDevice
  }
}
</script>