<template>
  <v-row
    class="fill-height overflow-y-auto pa-2"
    align-content="start"
    no-gutters
  >
    <v-col cols="12" md="6" lg="5" class="pr-md-1 mb-2">
      <UserTable></UserTable>
    </v-col>
    <v-col cols="12" md="6" lg="5" class="pl-md-1">
      <SensorTable></SensorTable>
    </v-col>
  </v-row>
</template>

<script>
import UserTable from '@/components/Admin/UserTable'
import SensorTable from '@/components/Admin/SensorTable'

export default {
  components: {
    UserTable,
    SensorTable
  }
}
</script>