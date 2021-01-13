<template>
  <v-row no-gutters class="fill-height">
    <v-navigation-drawer
      v-if="!isMobile"
      v-model="toolBarDrawer"
      mobile-breakpoint="960"
      class="fill-height"
      width="450"
      app
      fixed
      clipped
    >
      <MainToolbar/>
    </v-navigation-drawer>
    <v-col cols="12" :style="mapHeight">
      <MainMap/>
    </v-col>
    <v-col v-if="isMobile" :style="toolBarHeight">
      <MainToolbar/>
    </v-col>
    <v-navigation-drawer
      v-model="drawer"
      class="fill-height"
      mobile-breakpoint="960"
      fixed
      width="450"
      app
      right
      clipped
    >
      <AlertBar/>
    </v-navigation-drawer>
  </v-row>
</template>

<script>
import MainToolbar from '@/components/Home/MainToolbar'
import AlertBar from '@/components/Home/AlertBar'
import MainMap from '@/components/Home/MainMap'
import { mapState } from 'vuex'

export default {
  name: 'Home',
  components: {
    MainToolbar,
    AlertBar,
    MainMap
  },
  mounted () {
    this.$store.dispatch('getUserInfoFromCookie');

    if (!this.isMobile) {
      this.$store.dispatch('toggleMainToolBar');
      this.$store.dispatch('toggleMainAlertBar');
    }
  },
  computed: {
    // mixed layout for mobile
    toolBarDrawer: {
      get: function () { return this.$store.state.log.drawer },
      set: function (v) { this.$store.state.log.drawer = v }
    },
    drawer: {
      get: function () { return this.$store.state.alert.main.drawer },
      set: function (v) { this.$store.state.alert.main.drawer = v }
    },
    isMobile () {
      if (this.$vuetify.breakpoint.smAndDown)
        return true;
      else
        return false;
    },
    mapHeight () {
      if (this.$vuetify.breakpoint.smAndDown)
        return 'height: 40%';
      else
        return 'height: 100%';
    },
    toolBarHeight () {
      if (this.$vuetify.breakpoint.smAndDown)
      // added max-width to 100vw to fix over width chart problem
        return 'height: 60%; max-width: 100vw;';
      else
        return 'height: 0%; max-width: 100vw;';
    }
  }
}
</script>