<template>
  <v-card>
    <v-card-title class="primary white--text">로그인</v-card-title>
    <v-card-text>
      <v-form
        class="px-2 pt-2"
        ref="form"
        v-model="valid"
      >
        <v-text-field
          v-model="userName"
          :rules="userNameRules"
          label="아이디"
          required
        ></v-text-field>

        <v-text-field
          v-model="password"
          type="password"
          :rules="passwordRules"
          label="비밀번호"
          required
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text :disabled="!valid" @click="onSubmit()">
        로그인
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      valid : false,
      userName: '',
      password: '',
      userNameRules: [
        v => !!v || '아이디는 필수입니다.',
        v => (v && v.length) <= 20 || '아이디는 20글자를 넘길 수 없습니다.'
      ],
      passwordRules: [
        v => !!v || '비밀번호는 필수입니다.',
        v => (v && v.length) <= 20 || '비밀번호는 20글자를 넘길 수 없습니다.'
      ]
    }
  },
  methods: {
    onSubmit () {
      return axios.post(`${process.env.VUE_APP_API_URI}/auths/login`, { userName: this.userName, password: this.password }, { withCredentials: true })
        .then(response => {
          this.$router.push('/');
          this.$store.dispatch('setSnackBar', { text: '로그인 되었습니다.', color: 'green' });
        })
        .catch(error => {
          if (error.response.request.status === 404) {
            this.$store.dispatch('setSnackBar', { text: '서버와 연결할 수 없습니다.', color: 'red' });
          } else if (error.response.request.status === 401) {
            // user not exists
            this.$store.dispatch('setSnackBar', { text: '아이디 혹은 비밀번호를 확인해 주세요.', color: 'red' });
          } else {
            // other errors
            this.$store.dispatch('setSnackBar', { text: '알 수 없는 에러가 발생하였습니다.', color: 'red' });
          }
        });
    }
  }
}
</script>