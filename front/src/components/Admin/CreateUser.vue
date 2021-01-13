<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500"
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
        <v-card-title class="secondary white--text">
          <span class="headline">사용자 등록</span>
        </v-card-title>
        <v-card-text class="mt-2 py-0">
          <v-form
            v-model="valid"
            ref="form"
          >
            <v-container ma-0 pa-0>
              <v-row>
                <v-col cols="12" class="py-0">
                  <v-text-field
                    label="아이디"
                    hint="로그인 시 이용할 아이디"
                    v-model="userName"
                    :rules="userNameRules"
                    :counter="20"
                    required></v-text-field>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-text-field
                    label="비밀번호"
                    v-model="password"
                    :rules="passwordRules"
                    :counter="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="py-0">
                  <v-text-field
                    label="이름"
                    v-model="name"
                    :rules="nameRules"
                    :counter="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="4" class="py-0 " align-self="end">
                  <v-switch v-model="isAdmin" label="관리자"></v-switch>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!valid"
            @click="onSubmit()"
            color="primary"
            text
          >
            완료
          </v-btn>
          <v-btn color="error" text @click="onCancel()">취소</v-btn>
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
      userName: '',
      password: '',
      name: '',
      isAdmin: false,
      nameRules: [
        v => !!v || '이름은 필수 입니다.',
        v => (v && v.length <= 20) || '이름은 20글자를 넘길 수 없습니다.'
      ],
      userNameRules: [
        v => !!v || '아이디는 필수 입니다.',
        v => (v && v.length >= 4) || '아이디는 4글자 이상이어야 합니다.',
        v => (v && v.length <= 20) || '아이디는 20글자를 넘길 수 없습니다.'
      ],
      passwordRules: [
        v => !!v || '비밀번호는 필수 입니다.',
        v => (v && v.length >= 6) || '비밀번호는 6글자 이상이어야 합니다.',
        v => (v && v.length <= 20) || '비밀번호는 20글자를 넘길 수 없습니다.'
      ],
      isAdminRules: [
        v => !!v || '관리자 여부는 필수 입니다.'
      ]
    }
  },
  methods: {
    onSubmit () {
      this.$store.dispatch('createUser', {
        name: this.name,
        userName: this.userName,
        password: this.password,
        isAdmin: this.isAdmin
      })
      .then(response => {
        this.dialog = false;
        this.clearForm();
        this.$store.dispatch('setSnackBar', { text: '사용자가 추가되었습니다.', color: 'green' });
      })
      .catch(error => {
        this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
      })
    },
    onCancel () {
      this.clearForm();
      this.dialog = false;
    },
    clearForm () {
      this.$refs.form.reset();
    }
  }
}
</script>