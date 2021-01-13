<template>
  <v-snackbar
    v-model="visible"
    :timeout="3000"
    :color="colors"
    app
  >
    {{ text }}
  </v-snackbar>
</template>

<script>

export default {
  computed: {
    visible: {
      get () {
        return this.$store.state.snackbar.isVisible
      },
      set (value) {
        this.$store.dispatch('setSnackBarVisible', value)
      }
    },
    text () {
      return this.$store.state.snackbar.text
    },
    colors () {
      return this.$store.state.snackbar.color
    }
  }
}

</script>
