<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="300"
  >
    <template v-slot:activator="{ on }">
      <v-icon
        v-on="on"
        small
      >
        mdi-delete
      </v-icon>
    </template>
    <v-card>
      <v-card-title class="red white--text py-4">
        경고
      </v-card-title>
      <v-card-text class="mt-4">
        <div class="text-subtitle-1">센서를 삭제합니다.</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          @click="onSubmit"
          color="blue darken-1"
          text
        >
          삭제
        </v-btn>
        <v-btn color="blue darken-1" text @click="dialog = false">취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['sensor'],
  data: function () {
    return {
      dialog: false
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('deleteSensor', this.sensor.sensorId)
      .then(response => {
        this.dialog = false;
        this.$store.dispatch('setSnackBar', { text: '센서가 삭제되었습니다.', color: 'green' });
      })
      .catch(error => {
        if (error.status == 409) {
          this.$store.dispatch('setSnackBar', { text: '센서를 삭제하려면 연결된 기기를 삭제해야 합니다.', color: 'red' });
        } else {
          this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
        }
        this.dialog = false;
      })
    }
  }
}
</script>