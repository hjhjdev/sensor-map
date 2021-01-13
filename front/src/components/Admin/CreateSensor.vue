<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="300"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          color="white"
          icon
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="secondary white--text py-4">
          센서 등록
        </v-card-title>
        <v-card-text class="mt-4 py-0">
          <v-form
            v-model="valid"
            ref="form"
          >
            <v-container ma-0 pa-0>
              <v-row>
                <v-col cols="12" class="py-0">
                  <v-text-field
                    label="이름"
                    v-model="name"
                    :rules="nameRules"
                    :counter="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-checkbox
                    v-model="isAnalog"
                    label="4-20mA 센서"
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
            color="primary"
            @click="onSubmit()"
            text
          >
            완료
          </v-btn>
          <v-btn text color="error" @click="onCancel()">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      dialog: false,
      valid: false,
      name: '',
      isAnalog: false,
      nameRules: [
        v => !!v || '이름은 필수 입니다.',
        v => (v && v.length <= 20) || '이름은 20글자를 넘길 수 없습니다.'
      ]
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('createSensor', {
        name: this.name,
        isAnalog: this.isAnalog
      })
        .then(response => {
          this.clearForm();
          this.dialog = false;
          this.$store.dispatch('setSnackBar', { text: '센서가 추가되었습니다.', color: 'green' });
        })
        .catch(error => {
          this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
        })
    },
    onCancel () {
      this.clearForm();
      this.dialog = false
    },
    clearForm () {
      this.$refs.form.reset();
      this.isAnalog = false;
    }
  }
}
</script>