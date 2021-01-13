<template>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          @click="copy"
          dark
          icon
          color="white"
        >
          <v-icon>mdi-database-edit</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="secondary white--text py-4">
          기기 수정
        </v-card-title>
        <v-card-text>
          <v-form
            v-model="valid"
            ref="form"
          >
            <v-container ma-0 pa-0>
              <v-row>
                <v-col cols="12" class="pt-5 pb-1">
                  <v-text-field
                    label="이름"
                    hint="지도에 표시될 이름"
                    v-model="data.name"
                    :rules="nameRules"
                    :counter="20"
                    required></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <v-text-field
                    label="MAC 주소"
                    hint="NodeMCU의 MAC 주소"
                    v-model="data.macAddress"
                    :rules="macAddressRules"
                    :counter="12"
                    required></v-text-field>
                </v-col>
                <v-col cols="6" class="py-1">
                  <v-text-field
                    label="전화번호"
                    v-model="data.chargePhone"
                    :rules="chargePhoneRules"
                    :counter="11"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <v-text-field
                    label="회사명"
                    v-model="data.companyName"
                    :rules="companyNameRules"
                    :counter="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="6" class="py-1">
                  <v-text-field
                    label="담당자명"
                    v-model="data.chargeName"
                    :rules="chargeNameRules"
                    :counter="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <v-select
                    label="측정 모드"
                    v-model="data.measureMode"
                    :items="measureModeList"
                    :rules="measureModeRules"
                    item-text="name"
                    item-value="value"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
                  <v-text-field
                    label="이상치 임계값"
                    v-model="data.analogOutlier"
                    :rules="analogOutlierRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-select
                    label="필드1 - 온도"
                    v-model="data.sensorOneId"
                    :rules="sensorRules"
                    :items="nonAnalogSensorList"
                    item-text="name"
                    item-value="sensorId"
                    disabled
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-select
                    label="필드2 - 습도"
                    v-model="data.sensorTwoId"
                    :rules="sensorRules"
                    :items="nonAnalogSensorList"
                    item-text="name"
                    item-value="sensorId"
                    disabled
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-select
                    label="필드3 - 아날로그"
                    v-model="data.sensorThreeId"
                    :rules="sensorRules"
                    :items="analogSensorList"
                    item-text="name"
                    item-value="sensorId"
                    disabled
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-text-field
                    label="적정값"
                    hint="0.0"
                    v-model="data.analogNormal"
                    :rules="sensorRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-text-field
                    label="경고값"
                    hint="0.0"
                    v-model="data.analogWarning"
                    :rules="sensorRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-text-field
                    label="위험값"
                    hint="0.0"
                    v-model="data.analogDanger"
                    :rules="sensorRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="pt-1 pb-0">
                  <v-text-field
                    label="위도"
                    disabled
                    required
                    :value="data.latitude"
                    :rules="locationRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6" class="pt-1 pb-0">
                  <v-text-field
                    label="경도"
                    disabled
                    required
                    :value="data.longitude"
                    :rules="locationRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <SetLatLng @newLocation="updateLocation" :oldLocation="oldLocation"></SetLatLng>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text :disabled="!valid" @click="onSubmit()">저장</v-btn>
          <v-btn color="error" text @click="onCancel()">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import SetLatLng from './SetLatLng'

export default {
  props: ['device'],
  components: {
    SetLatLng
  },
  data () {
    return {
      dialog: false,
      valid : false,
      data: {
        name: '',
        macAddress: '',
        companyName: '',
        chargeName: '',
        chargePhone: '',
        sensorOneId: '',
        sensorTwoId: '',
        sensorThreeId: '',
        measureMode: '',
        analogNormal: '',
        analogWarning: '',
        analogDanger: '',
        analogOutlier: '',
        latitude: '',
        longitude: ''
      },
      measureModeList: [
        { name: 'Ceiling(1초)', value: 'CE' },
        { name: 'STEL(최근 15분 평균)',    value: 'ST' },
        { name: 'TWA(최근 8시간 평균)',     value: 'TW' }
      ],
      nameRules: [
        v => !!v || '이름은 필수입니다.',
        v => (v && v.length) <= 12 || '이름은 20글자를 넘길 수 없습니다.'
      ],
      macAddressRules: [
        v => !!v || 'MAC 주소는 필수입니다.',
        v => (v && v.length) == 12 || 'MAC 주소 12자리를 올바르게 입력해야 합니다.'
      ],
      companyNameRules: [
        v => !!v || '회사명은 필수입니다.',
        v => (v && v.length) <= 20 || '회사명은 20글자를 넘길 수 없습니다.'
      ],
      chargeNameRules: [
        v => !!v || '담당자명은 필수입니다.',
        v => (v && v.length) <= 20 || '담당자명은 20글자를 넘길 수 없습니다.'
      ],
      chargePhoneRules: [
        v => !!v || '전화번호는 필수입니다.',
        v => (v && v.length) <= 11 || '전화번호는 11글자를 넘길 수 없습니다.'
      ],
      locationRules: [
        v => !!v || '위치 설정은 필수입니다.'
      ],
      measureModeRules: [
        v => !!v || '측정 모드는 필수입니다.'
      ],
      analogOutlierRules: [
        v => !!v || '이상치 임계값은 필수입니다.'
      ],
      sensorRules: [
        v => !!v || '센서 설정은 필수입니다.'
      ]
    }
  },
  computed: {
    nonAnalogSensorList () {
      return this.$store.state.sensor.list.filter(item => item.isAnalog === false)
    },
    analogSensorList () {
      return this.$store.state.sensor.list.filter(item => item.isAnalog === true )
    },
    oldLocation () {
      return {
        longitude: this.data.longitude,
        latitude: this.data.latitude
      }
    },
  },
  methods: {
    copy () {
        this.data.name = this.device.name;
        this.data.macAddress = this.device.macAddress;
        this.data.companyName = this.device.companyName;
        this.data.chargeName = this.device.chargeName;
        this.data.chargePhone = this.device.chargePhone;
        this.data.sensorOneId = this.device.sensorOneId;
        this.data.sensorTwoId = this.device.sensorTwoId;
        this.data.sensorThreeId = this.device.sensorThreeId;
        this.data.measureMode = this.device.measureMode;
        this.data.analogNormal = this.device.analogNormal;
        this.data.analogWarning = this.device.analogWarning;
        this.data.analogDanger = this.device.analogDanger;
        this.data.analogOutlier = this.device.analogOutlier;
        this.data.latitude = this.device.latitude;
        this.data.longitude = this.device.longitude;
    },
    updateLocation (data) {
      this.data.latitude = data.latitude;          
      this.data.longitude = data.longitude;
    },
    onSubmit () {
      // edit single device
      this.$store.dispatch('editDevice', {
        deviceId: this.device.deviceId,
        data: this.data
      }).then(() => {
        // unload markers
        this.$store.dispatch('emptyMarkerList')
      }).then(() => {
        // reload markers
        this.$store.dispatch('getDeviceList').then(() => {
          for (let i = 0; i < this.$store.state.device.list.length; i++) {
            // then add markers
            this.addMarker(this.$store.state.device.list[i]);
          }
        })
        this.clearForm();
        this.dialog = false;
      }).catch(error => {
        if (error.status === 409) {
          this.$store.dispatch('setSnackBar', { text: '동일한 이름 혹은 MAC 주소가 있습니다.', color: 'red' });
        } else {
          this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
        }
      })
    },
    addMarker (data) {
      this.$store.dispatch('addMarker', {
        deviceId: data.deviceId,
        latitude: data.latitude,
        longitude: data.longitude
      });
    },
    onCancel () {
      this.clearForm();
      this.dialog = false
    },
    clearForm () {
      this.data.name = '',
      this.data.macAddress = '',
      this.data.companyName = '',
      this.data.chargeName = '',
      this.data.chargePhone = '',
      this.data.sensorOneId = '',
      this.data.sensorTwoId = '',
      this.data.sensorThreeId = '',
      this.data.measureMode = '',
      this.data.analogNormal = '',
      this.data.analogWarning = '',
      this.data.analogDanger = '',
      this.data.analogOutlier = '',
      this.data.latitude = '',
      this.data.longitude = ''
    }
  }
}
</script>