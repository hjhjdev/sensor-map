<template>
  <v-dialog
    v-model="dialog"
    max-width="30rem"
    scrollable
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-on="on"
        v-bind="attrs"
        color="white"
        icon
      >
        <v-icon>mdi-folder-download</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="primary white--text pt-4">
        다운로드
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          @click="close()"
          icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="primary">
        <v-row class="no-gutters pb-1" justify="end">
          <v-col
            cols="12"
            class="pb-2"
          >
            <span class="text-subtitle-1 white--text">파일 다운로드시 최대 2분 정도의 시간이 소요됩니다.</span>
          </v-col>
          <v-col
            cols="12"
            sm="6"
            class="pr-0 pr-sm-3"
          >
            <v-select
              v-model="deviceId"
              prepend-icon="mdi-cellphone"
              label="기기 선택"
              :items="deviceList"
              item-text="name"
              item-value="deviceId"
              dense
              dark
              hide-details
              single-line
              required
            ></v-select>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-select
              prepend-icon="mdi-leak"
              label="센서 선택"
              v-model="sensorId"
              :items="sensorList"
              item-text="name"
              item-value="sensorId"
              dark
              dense
              hide-details
              single-line
              required
            ></v-select>
          </v-col>
          <v-spacer></v-spacer>
          <v-col
            cols="12"
            sm="6"
            class="pr-0 pr-sm-3"
          >
            <v-menu
              v-model="menu"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="startDate"
                  label="시작 날짜 선택"
                  prepend-icon="mdi-calendar"
                  dark
                  dense
                  single-line
                  hide-details
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="startDate"
                :max="maxStartDate()"
                @input="onStartDateInput()"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            sm="6"
          >
            <v-menu
              v-model="menu2"
              :close-on-content-click="false"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="endDate"
                  label="끝 날짜 선택"
                  prepend-icon="mdi-calendar"
                  dark
                  dense
                  single-line
                  hide-details
                  readonly
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                :max="maxEndDate()"
                :min="startDate"
                v-model="endDate"
                @input="menu2 = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-col
            cols="12"
            class="mt-4 text-right"
          >
            <v-btn outlined dark :disabled="!isFilled" @click="download()">
              다운로드
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { formatISO, format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { addHours, addDays, parseISO } from 'date-fns'
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  data: function() {
    return {
      dialog: false,
      menu: false,
      menu2: false,
      deviceId: '',
      sensorId: '',
      startDate: '',
      endDate: '',
      search: {
        start: '',
        end: ''
      }
    }
  },
  computed: {
    ...mapState({
      deviceList: state => state.device.list,
      sensorAllList: state => state.sensor.list
    }),
    selectedDevice () {
      let index = this.$store.state.device.list.findIndex((device) => device.deviceId === this.deviceId, 1)
      return this.$store.state.device.list[index]
    },
    sensorList () {
      if (this.deviceId)
        return this.sensorAllList.filter(item => [
          this.selectedDevice.sensorOneId,
          this.selectedDevice.sensorTwoId,
          this.selectedDevice.sensorThreeId
          ].includes(item.sensorId));
      else
        return [];
    },
    isFilled () {
      if ([this.startDate, this.endDate, this.sensorId, this.deviceId].every(Boolean)) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    onStartDateInput () {
      this.endDate = "";
      this.menu = false;
    },
    maxStartDate () {
      return format(new Date(), 'yyyy-MM-dd');
    },
    maxEndDate () {
      if (this.startDate == '')
        return '2000-01-01';
      else
        return format(addDays(parseISO(this.startDate), 9), 'yyyy-MM-dd');
    },
    download() {
      
      if (this.startDate )
      this.search.start = parseISO(this.startDate).toISOString();
      this.search.end = addDays(parseISO(this.endDate), 1).toISOString();

      const url = `${process.env.VUE_APP_API_URI}/logs/blobs` +
        '?deviceId=' + this.deviceId +
        '&sensorId=' + this.sensorId +
        '&startDate='+ this.search.start +
        '&endDate='  + this.search.end;

      window.open(url);
    },
    close() {
      this.dialog = false;

      this.deviceId = '';
      this.sensorId = '';
      this.search.start = '';
      this.search.end = '';
      this.search.offset = 0;
    }
  }
}
</script>
