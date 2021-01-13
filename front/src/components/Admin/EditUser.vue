<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="500"
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
        수정
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
                  label="아이디"
                  hint="로그인 시 이용할 아이디"
                  v-model="data.userName"
                  :rules="userNameRules"
                  :counter="20"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" class="py-0">
                <v-text-field
                  label="비밀번호 (수정 시 변경)"
                  v-model="data.password"
                  :rules="passwordRules"
                  :counter="20"
                  
                ></v-text-field>
              </v-col>
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
                  v-model="data.isAdmin"
                  label="관리자"
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
  props: ['user'],
  data: function () {
    return {
      dialog: false,
      valid: false,
      data: {
        userName: '',
        password: '',
        name: '',
        isAdmin: false
      },
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
      ]
    }
  },
  methods: {
    copy () {
      this.data.userName = this.user.userName;
      this.data.password = '******';
      this.data.name = this.user.name;
      this.data.isAdmin = this.user.isAdmin;
    },
    onSubmit () {
      // check password unchanged
      if (this.data.password === '******') {
        delete this.data.password;
      }

      this.$store.dispatch('editUser', {
        userId: this.user.userId,
        data: this.data
      })
      .then(response => {
        this.dialog = false
        this.$refs.form.reset();
        this.$store.dispatch('setSnackBar', { text: '사용자가 수정되었습니다.', color: 'green' });
      })
      .catch(error => {
        this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
      })
    }
  }
}
</script>