<template>
  <v-app>
    <v-app-bar
      v-if="!inLogin"
      color="primary"
      clipped-right
      clipped-left
      dark
      dense
      app
    >
      <v-icon class="pr-4" to="/">mdi-map</v-icon> 
      <v-toolbar-title >Sensor-Map</v-toolbar-title>
      <v-spacer></v-spacer>
      <template v-if="isAdmin && isHome">
        <CreateDevice/>
      </template>
      <v-btn
        v-if="isMobile"
        class="ml-1"
        icon
        @click="toggle()"
      >
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-btn
        class="ml-1"
        to="/"
        icon
      >
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn
        v-if="isAdmin"
        class="ml-1"
        to="/admin"
        icon
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>

    </v-app-bar>
    <v-main>
      <v-container fluid fill-height class="pa-0 ma-0">
        <router-view></router-view>
      </v-container>
    </v-main>
    <SnackBar/>
  </v-app>
</template>

<style>
html {
  overflow: auto !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>

<script>
import SnackBar from '@/components/Shared/SnackBar'
import AlertBar from '@/components/Home/AlertBar'
import CreateDevice from '@/components/Home/CreateDevice'
import VueCookies from 'vue-cookies'

export default {
  name: 'App',
  components: {
    SnackBar,
    AlertBar,
    CreateDevice
  },
  methods: {
    toggle () {
      this.$store.dispatch('toggleMainAlertBar');
    },
    logout () {
      VueCookies.remove('user');
      // redirect to login
      this.$router.push('/login');
    },
  },
  mounted () {
    this.$store.dispatch('getUserInfoFromCookie');
  },
  computed: {
    inLogin () {
      if (this.$route.name === 'Login')
        return true;
      else
        return false;
    },
    isAdmin () {
      if (this.$store.state.user.userInfo.isAdmin)
        return true;
      else
        return false;
    },
    isHome () {
      if (this.$route.path == '/')
        return true;
      else
        return false;
    },
    isMobile () {
      if (this.$vuetify.breakpoint.smAndDown)
        return true;
      else
        return false;
    }
  }
};
</script>
