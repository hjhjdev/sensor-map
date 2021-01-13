<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="500"
  >
    <template v-slot:activator="{ on }">
      <v-icon
        v-on="on"
        @click="loadResource()"
        small
      >
        mdi-database-edit
      </v-icon>
    </template>
    <v-card>
      <v-card-title class="primary white--text py-4">
        <span class="text-subtitle-1">기기 열람 권한 수정</span>
      </v-card-title>
      <v-card-text class="mt-4">
        <v-form ref="form">
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="select"
                  :items="preRoleList()"
                  item-text="deviceId"
                  label="지도에서 보여질 기기를 선택하세요."
                  multiple
                  return-object
                ></v-select>
              </v-col>
            </v-row>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary darken-1" text @click="onSubmit()">저장</v-btn>
        <v-btn color="error darken-1" text @click="onCancel()">취소</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: ['userId'],
  data () {
    return {
      dialog: false,
      select: [],
      items: []
    }
  },
  computed: {
    ...mapState({
      deviceList: state => state.device.list,
      roleList: state => state.role.list
    }),
  },
  methods: {
    preRoleList () {
      return this.deviceList.map((item) => {
        return {
          userId: this.userId,
          deviceId: item.deviceId
        }
      })
    },
    loadResource() {
      this.$store.dispatch('getDeviceList');
      this.$store.dispatch('getRoleList', this.userId)
        .then(() => {
          this.select = this.roleList;
        });
    },
    onSubmit () {
      let toAdd = this.select.filter(i => !this.roleList.map(b=>b.deviceId).includes(i.deviceId));
      let toDelete = this.roleList.filter(i => !this.select.map(b=>b.deviceId).includes(i.deviceId));
      
      try {
        this.processArray(toAdd, 'createRole');
        this.processArray(toDelete, 'deleteRole');
        this.clearForm();
        this.dialog = false;
        this.$store.dispatch('setSnackBar', { text: '보여질 기기 수정이 완료되었습니다.', color: 'green' });
      } catch (err) {
        this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
      }
    },
    async processArray(array, dispatch) {
      for (const x of array) {
        await this.$store.dispatch(dispatch, x);
      }
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