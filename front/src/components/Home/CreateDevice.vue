<template>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="500"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          icon
        >
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="secondary white--text py-4">
          기기 추가
        </v-card-title>
        <v-card-text>
          <v-container ma-0 pa-0>
            <v-form ref="form" v-model="valid">
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
                <v-col cols="6" class="py-1">
                  <v-text-field
                    label="회사명"
                    v-model="data.companyName"
                    :rules="companyNameRules"
                    :counter="20"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="py-1">
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
                    required
                  ></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <v-container ma-0 pa-0>
            <v-form ref="form2" v-model="valid2">
              <v-row>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-text-field
                    label="적정값"
                    type="number"
                    hint="0.0"
                    v-model="data.analogNormal"
                    :rules="normalSensorRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-text-field
                    label="경고값"
                    type="number"
                    hint="0.0"
                    v-model="data.analogWarning"
                    :rules="warningSensorRules"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="4" md="4" class="py-1">
                  <v-text-field
                    label="위험값"
                    type="number"
                    hint="0.0"
                    v-model="data.analogDanger"
                    :rules="dangerSensorRules"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
          <v-container ma-0 pa-0>
            <v-form ref="form3" v-model="valid3">
              <v-row>
                <v-col cols="12" sm="6" class="pt-1 pb-0">
                  <v-text-field
                    label="위도"
                    disabled
                    required
                    :value="data.latitude"
                    :rules="locationRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" class="pt-1 pb-0">
                  <v-text-field
                    label="경도"
                    disabled
                    required
                    :value="data.longitude"
                    :rules="locationRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <SetLatLng @newLocation="updateLocation"></SetLatLng>
                </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text :disabled="!(valid && valid2 && valid3)" @click="onSubmit()">저장</v-btn>
          <v-btn color="error" text @click="onCancel()">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import SetLatLng from './SetLatLng'

export default {
  components: {
    SetLatLng
  },
  data () {
    return {
      dialog: false,
      valid : false,
      valid2 : false,
      valid3: false,
      data: {
        name: '',
        macAddress: '',
        companyName: '',
        chargeName: '',
        chargePhone: '',
        sensorOneId: 1,
        sensorTwoId: 2,
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
        { name: 'STEL(최근 15분 평균)', value: 'ST' },
        { name: 'TWA(최근 8시간 평균)', value: 'TW' }
      ],
      nameRules: [
        v => !!v || '이름은 필수입니다.',
        v => (v && v.length) <= 12 || '20글자를 넘길 수 없습니다.'
      ],
      macAddressRules: [
        v => !!v || 'MAC 주소는 필수입니다.',
        v => /^[A-Z]*$/.test(v) || '대문자 12자리를 입력해야 합니다.',
        v => (v && v.length) == 12 || '12자리를 입력해야 합니다.'
      ],
      companyNameRules: [
        v => !!v || '회사명은 필수입니다.',
        v => (v && v.length) <= 20 || '20글자를 넘길 수 없습니다.'
      ],
      chargeNameRules: [
        v => !!v || '담당자명은 필수입니다.',
        v => (v && v.length) <= 20 || '20글자를 넘길 수 없습니다.'
      ],
      chargePhoneRules: [
        v => !!v || '전화번호는 필수입니다.',
        v => (v && v.length) <= 11 || '11글자를 넘길 수 없습니다.'
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
      ],
      normalSensorRules: [
        v => !!v || '센서 설정은 필수입니다.',
        v => (v < this.data.analogWarning) || '경고값 보다 작아야 합니다.',
        v => (v < this.data.analogDanger) || '위험값 보다 작아야 합니다.'
      ],
      warningSensorRules: [
        v => !!v || '센서 설정은 필수입니다.',
        v => (v > this.data.analogNormal) || '적정값 보다 커야 합니다.',
        v => (v < this.data.analogDanger) || '위험값 보다 작아야 합니다.'
      ],
      dangerSensorRules: [
        v => !!v || '센서 설정은 필수입니다.',
        v => (v > Number(this.data.analogNormal)) || '적정값 보다 커야 합니다.',
        v => (v > Number(this.data.analogWarning)) || '경고값 보다 커야 합니다.'
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
    sensorValues () {
      return {
        analogNormal: this.data.analogNormal,
        analogWarning: this.data.analogWarning,
        analogDanger: this.data.analogDanger
      }
    }
  },
  watch: {
    // watch only sensor values
    sensorValues: {
      handler () {
        this.validate();
      },
      deep: true
    }
  },
  methods: {
    validate () {
      this.$refs.form2.validate();
    },
    updateLocation (data) {
      this.data.latitude = data.latitude;          
      this.data.longitude = data.longitude;
    },
    onSubmit () {
      this.$store.dispatch('createDevice', this.data).then((res) => {
        let device = this.$store.state.device.list.find(item => item.latitude === this.data.latitude);
        this.$store.dispatch('addMarker', {
          deviceId: device.deviceId,
          latitude: device.latitude,
          longitude: device.longitude
        })
      }).then(() => {
        this.clearForm();
        this.dialog = false;
        this.$store.dispatch('setSnackBar', { text: '기기가 추가되었습니다.', color: 'green' });
      })
      .catch(error => {
        if (error.status === 401) {
          this.$router.push('/login');
          this.$store.dispatch('setSnackBar', { text: '로그인 후 이용할 수 있습니다.', color: 'red' });
        } else if (error.status === 409) {
          this.$store.dispatch('setSnackBar', { text: '동일한 이름 혹은 MAC 주소가 있습니다.', color: 'red' });
        } else  {
          this.$store.dispatch('setSnackBar', { text: '서버 오류가 발생했습니다.', color: 'red' });
        }
      })
    },
    onCancel () {
      this.clearForm();
      this.dialog = false
    },
    clearForm () {
      this.$refs.form.reset();
    }
  }
}
</script>