<template>
  <v-row no-gutters class="fill-height justify-center align-center">
    <v-col class="px-2" xs="12" sm="4" lg="3">
      <Login/>
    </v-col>
  </v-row>
</template>

<script>
import Login from '@/components/Login/Login'

export default {
  name: 'Home',
  components: {
    Login
  },
  
}
</script>
