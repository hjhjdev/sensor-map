<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="400"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          icon
          color="white"
        >
          <v-icon>mdi-database-remove</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="error white--text py-4">
          <span class="headline">경고</span>
        </v-card-title>
        <v-card-text class="mt-4">
          <span class="text-subtitle-1">기기를 삭제 하시겠습니까?<br/>저장된 로그가 모두 삭제되며, 되돌릴 수 없습니다.</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="onSubmit"
            color="primary"
            text
          >
            삭제
          </v-btn>
          <v-btn color="error" text @click="dialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ['device'],
  data: function () {
    return {
      dialog: false
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('disableMarkerInfoVisible', this.device.deviceId).then(() => {
        this.$store.dispatch('deleteMarker', this.device.deviceId);
      }).then(() => {
        this.$store.dispatch('deleteDevice', this.device.deviceId);
        this.dialog = false;
        this.$store.dispatch('setSnackBar', { text: '기기가 삭제되었습니다.', color: 'green' });
      })
      .catch(error => {
        this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
      })
    },
  }
}
</script>