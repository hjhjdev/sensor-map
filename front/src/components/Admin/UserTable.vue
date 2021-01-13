<template>
  <v-card
    class="mx-auto"
    outlined
  >
    <v-card-title class="primary white--text">
      사용자
      <v-spacer></v-spacer>
      <CreateUser></CreateUser>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="userList"
      :items-per-page="10"
      mobile-breakpoint="0"
      disable-sort
      class="elevation-1"
    >
      <template v-slot:[`item.isAdmin`]="{ item }">
        <v-simple-checkbox
          v-model="item.isAdmin"
          disabled
        ></v-simple-checkbox>
      </template>
      <template v-slot:[`item.password`]="">
        ****
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <EditUser :user="item"></EditUser>
        <template v-if="!item.isAdmin">
          <EditRole :userId="item.userId"></EditRole>
        </template>
        <DeleteUser :user="item"></DeleteUser>
      </template>
      <template v-slot:no-data>
        <p>No data</p>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import CreateUser from './CreateUser'
import EditUser from './EditUser'
import DeleteUser from './DeleteUser'
import EditRole from './EditRole'

export default {
  components: {
    CreateUser,
    EditUser,
    DeleteUser,
    EditRole
  },
  data () {
    return {
      headers: [
        { text: '관리자', value: 'isAdmin' , align: 'center' },
        { text: '이름', value: 'name' , align: 'center' },
        { text: '아이디', value: 'userName' , align: 'center' },
        { text: '비밀번호', value: 'password' , align: 'center' },
        { text: '수정', value: 'actions' , align: 'center' },
      ]
    }
  },
  computed: {
    userList () {
      return this.$store.state.user.list
    }
  },
  created () {
    this.$store.dispatch('getUserList')
  },
  methods: {
  }
}
</script>