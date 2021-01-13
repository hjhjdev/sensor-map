<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="300"
  >
    <template v-slot:activator="{ on }">
      <v-icon
        v-on="on"
        @click="copy"
        small
      >
        mdi-pencil
      </v-icon>
    </template>
    <v-card>
      <v-card-title class="secondary white--text py-4">
        센서 수정
      </v-card-title>
      <v-card-text class="mt-4">
        <v-form
          v-model="valid"
          ref="form"
        >
          <v-container ma-0 pa-0>
            <v-row>
              <v-col cols="12" class="py-0">
                <v-text-field
                  label="이름"
                  v-model="data.name"
                  :rules="nameRules"
                  :counter="20"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0">
                <v-checkbox
                  v-model="data.isAnalog"
                  label="아날로그"
                ></v-checkbox>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          :disabled="!valid"
          @click="onSubmit"
          color="blue darken-1"
          text
        >
          수정
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
      dialog: false,
      valid: false,
      data: {
        name: this.sensor.name,
        isAnalog: this.sensor.isAnalog
      },
      nameRules: [
        v => !!v || '이름은 필수 입니다.',
        v => (v && v.length <= 20) || '이름은 20글자를 넘길 수 없습니다.'
      ]
    }
  },
  methods: {
    copy () {
      this.data.name = this.sensor.name;
      this.data.isAnalog = this.sensor.isAnalog;
    },
    onSubmit () {
      this.$store.dispatch('editSensor', {
        sensorId: this.sensor.sensorId,
        data: this.data
      })
      .then(response => {
        this.dialog = false
        this.$refs.form.reset()
        this.$store.dispatch('setSnackBar', { text: '센서가 수정되었습니다.', color: 'green' });
      })
      .catch(error => {
        this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
      })
    },
  }
}
</script>