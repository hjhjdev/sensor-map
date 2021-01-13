<template>
  <v-dialog
    v-model="dialog"
    max-width="40rem"
    scrollable
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn 
        v-on="on"
        v-bind="attrs"
        color="white"
        icon
      >
        <v-icon>mdi-folder-search</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="primary">
        <v-row class="no-gutters pt-3 pb-1" justify="end" align="center">
        <span class="white--text pl-2 text-h6">로그 검색</span>
        <v-spacer></v-spacer>
        <v-btn
          color="white"
          @click="close()"
          icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-row>
      <v-row class="no-gutters pb-1" justify="end">
        <v-col
          cols="12"
          sm="4"
          class="pr-3"
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
          sm="4"
          class="pr-3"
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
          sm="4"
        >
          <v-menu
            v-model="menu"
            :close-on-content-click="false"
            :nudge-right="40"
            transition="scale-transition"
            offset-y
            min-width="290px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="date"
                label="날짜 선택"
                append-outer-icon="mdi-magnify"
                @click:append-outer="searchAlert()"
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
              v-model="date"
              @input="menu = false"
            ></v-date-picker>
          </v-menu>
        </v-col>
        <v-col
          class="pt-2"
          align="end"
          cols="12"
        >
          <span class="white--text text-subtitle-1 pr-4">
            <v-text-field
            v-model="currentPage"
            style="display: inline-block; width: 5rem"
            reverse
            hide-details
            dense
            outlined
            dark
          ></v-text-field>
             / {{ totalPage() }}</span>
          <v-btn
            class="mr-1"
            color="white"
            icon
            :disabled="currentPage === 1"
            @click="firstPage()"
          >
            <v-icon>mdi-chevron-double-left</v-icon>
          </v-btn>
          <v-btn
            class="mr-1"
            color="white"
            icon
            :disabled="currentPage === 1"
            @click="leftPage()"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            class="mr-1"
            color="white"
            icon
            :disabled="currentPage === totalPage()"
            @click="rightPage()"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn
            class="mr-1"
            color="white"
            icon
            :disabled="currentPage === totalPage()"
            @click="lastPage()"
          >
            <v-icon>mdi-chevron-double-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      </v-card-title>
      <v-card-text class="px-0" style="height: 70vh">
        <!-- set mobile-breakpoint 0 to disable toggling mobile view -->
        <v-data-table
          dense
          hide-default-footer
          mobile-breakpoint="0"
          :page="totalPage()"
          :items-per-page="itemsPerPage"
          :headers="headers"
          :items="sub.list"
        >
          <template v-slot:[`item.device.name`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  {{ item.device.name }}
                </div>
              </template>
                {{ item.device.name }}
            </v-tooltip>
          </template>
          <template v-slot:[`item.sensor.name`]="{ item }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <div v-bind="attrs" v-on="on">
                  {{ item.sensor.name }}
                </div>
              </template>
                {{ item.sensor.name }}
            </v-tooltip>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">
            <div>
              {{ convertToTimeZone(item.createdAt) }}
            </div>
          </template>
          <template
            v-slot:[`item.measureModeValue`]="{ item }"
            class="pa-0 ma-0"
          >
            <!-- 
              check measureModeWarnLevel is set to outlier;
              outlier value is item.value, not measureModeValue
            -->
            <div v-if="item.measureModeWarnLevel === 3">
              {{ parseValue(item.value) }}
            </div>
            <div v-else>
              {{ parseValue(item.measureModeValue) }}
            </div>
          </template>
          <template v-slot:[`item.measureModeWarnLevel`]="{ item }">
            <v-chip
              :color="getColor(item.measureModeWarnLevel)"
              :dark="getDark(item.measureModeWarnLevel)"
              small
            >
              {{ getLevelString(item.measureModeWarnLevel) }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import addHours from 'date-fns/addHours'
import { format, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'
import { addDays, parseISO } from 'date-fns'
import { mapState } from 'vuex'

export default {
  data: function() {
    return {
      dialog: false,
      menu: false,
      deviceId: '',
      sensorId: '',
      lastDate: '',
      date: '',
      headers: [
        { text: '위치', value: 'device.name', align: 'center', sortable: false },
        { text: '가스', value: 'sensor.name', align: 'center', sortable: false },
        { text: '시각', value: 'createdAt', align: 'center', sortable: false },
        { text: '값', value: 'measureModeValue', align: 'center', sortable: false },
        { text: '단계', value: 'measureModeWarnLevel', align: 'center', sortable: false }
      ],
      currentPage: 1,
      itemsPerPage: 30,
      search: {
        start: '',
        end: '',
        offset: 0
      }
    }
  },
  computed: {
    ...mapState({
      sub: state => state.alert.sub,
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
    firstItemId () {
      if (this.sub.list[0])
        return this.sub.list[0].logId;
    },
    lastItemId () {
      if (this.sub.list[this.sub.list.length - 1])
        return this.sub.list[this.sub.list.length - 1].logId;
    }
  },
  watch: {
    currentPage (p) {
      this.search.offset = (this.currentPage - 1) * this.itemsPerPage;
    }
  },
  destroyed () {
    this.$store.dispatch('emptySubAlertList');
  },
  methods: {
    searchAlert () {
      if (this.lastDate !== this.date) {
        this.lastDate = this.date;
        // check empty values
        if (this.date == "" || this.deviceId == "" || this.sensorId == "") {
          alert('항목을 선택한 후 검색할 수 있습니다.')
        } else {
          this.currentPage = 1;
          this.search.start = parseISO(this.date).toISOString();
          this.search.end = addDays(parseISO(this.date), 1).toISOString();

          this.$store.dispatch('getSubAlertList', {
            deviceId: this.deviceId,
            sensorId: this.sensorId,
            startDate: this.search.start,
            endDate: this.search.end,
          })
        }
      } else {
        this.search.start = parseISO(this.date).toISOString();
          this.search.end = addDays(parseISO(this.date), 1).toISOString();

          if (this.currentPage > this.totalPage()) {
            this.currentPage = this.totalPage();
            this.search.offset = (this.currentPage - 1) * this.itemsPerPage;
          }
          if (this.currentPage < 1) {
            this.currentPage = 1;
            this.search.offset = 0
          } 

          this.$store.dispatch('getSubAlertList', {
            deviceId: this.deviceId,
            sensorId: this.sensorId,
            startDate: this.search.start,
            endDate: this.search.end,
            offset: this.search.offset
          })
      }
      
    },
    close() {
      this.dialog = false;

      this.deviceId = '';
      this.sensorId = '';
      this.search.start = '';
      this.search.end = '';
      this.search.offset = 0;
      this.currentPage = 1;
    
      this.$store.dispatch('emptySubAlertList');
    },
    totalPage () {
      if (this.sub.totalItems % this.itemsPerPage > 0)
        return Math.trunc(this.sub.totalItems / this.itemsPerPage) + 1;
      else
        return this.sub.totalItems / this.itemsPerPage;
    },
    convertToTimeZone(string) {
      return format(
        utcToZonedTime(string, 'Asia/Seoul'),
        'MM-dd HH:mm:ss',
        { timeZone: 'Asia/Seoul' }
      );
    },
    parseValue(value) {
      return Number.parseFloat(value).toFixed(3)
    },
    getLevelString(level) {
      switch (level) {
        case -1:
          return '없음'
        case 0: 
          return '정상'
        case 1:
          return '주의';
        case 2:
          return '위험';
        case 3:
          return '임계';
        default:
          return 'ER';
      }
    },
    getColor(level) {
      switch (level) {
        case 0:
          return 'green'
        case 1:
          return 'yellow';
        case 2:
          return 'red';
        case 3:
          return 'red darken-4';
        default:
          return 'grey';
      }
    },
    getDark(level) {
      switch (level) {
        case 1:
          return false;
        default:
          return true;
      }
    },
    firstPage () {
      this.currentPage = 1;
      this.search.offset = 0;
      this.searchAlert();
    },
    lastPage () {
      this.currentPage = this.totalPage();
      this.search.offset = (this.currentPage - 1) * this.itemsPerPage;
      this.searchAlert();
    },
    leftPage () {
      this.currentPage == 1 ? this.currentPage = 1 : this.currentPage--;
      this.search.offset = (this.currentPage - 1) * this.itemsPerPage
      this.searchAlert();
    },
    rightPage() {
      this.currentPage == this.totalPage() ? this.currentPage = this.totalPage : this.currentPage++;
      this.search.offset = (this.currentPage - 1) * this.itemsPerPage
      this.searchAlert();
    }
  }
}
</script>
