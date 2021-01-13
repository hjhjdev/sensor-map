<template>
  <v-row class="no-gutters flex-column fill-height">
    <v-col class="flex-grow-0">
      <v-card class="primary mx-2 my-2  px-4">
        <v-row class="no-gutters py-2" justify="start" align="center">
          <span class="white--text pl-2 text-h6">{{ userInfo.name }} / {{ userInfo.userName }}</span>
          <v-spacer></v-spacer>
          <v-btn
            @click="logout()"
            color="white"
            small
            icon
          >
            <v-icon>
              mdi-logout
            </v-icon>
          </v-btn>
        </v-row>
        <v-divider dark></v-divider>
        <v-row class="no-gutters pt-2 pb-1" justify="end" align="center">
          <div class="white--text pl-2 text-h6">실시간 알림</div>
          <v-btn
            class="ml-2"
            color="white"
            @click="reConnect()"
            icon
            small
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
          <v-spacer></v-spacer>
          <DownloadLog v-if="userInfo.isAdmin"/>
          <FullAlert></FullAlert>
          <v-btn
            class="ml-2"
            color="white"
            v-if="isMobile"
            @click="close()"
            icon
            small
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>
        <v-row class="no-gutters pb-1" justify="end" align="center">
          <div class="white--text ml-4">{{ page }} / {{ pageCount }}</div>
          <v-spacer></v-spacer>
          <v-btn
            class="mr-1"
            color="white"
            icon
            @click="firstPage()"
          >
            <v-icon>mdi-chevron-double-left</v-icon>
          </v-btn>
          <v-btn
            class="mr-1"
            color="white"
            icon
            @click="leftPage()"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            class="mr-1"
            color="white"
            icon
            @click="rightPage()"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn
            class="mr-1"
            color="white"
            icon
            @click="lastPage()"
          >
            <v-icon>mdi-chevron-double-right</v-icon>
          </v-btn>
        </v-row>
      </v-card>
    </v-col>
    <v-col class="flex-grow-1 overflow-y-hidden pb-2 px-2">
      <!-- nested v-card for scrollbar hidden -->
      <div class="fill-height overflow-y-hidden">
        <v-card class="fill-height overflow-y-auto">
          <!-- set mobile-breakpoint 0 to disable toggling mobile view -->
          <v-data-table
            mobile-breakpoint="0"
            dense
            hide-default-header
            hide-default-footer
            :page.sync="page"
            :items-per-page="itemsPerPage"
            @page-count="pageCount = $event"
            :headers="headers"
            :items="main.list"
          >
            <template v-slot:[`item.device.name`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on" class="text-truncate" style="max-width: 4rem;">
                    {{ item.device.name }}
                  </div>
                </template>
                  {{ item.device.name }}
              </v-tooltip>
            </template>
            <template v-slot:[`item.sensor.name`]="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on" class="text-truncate" style="max-width: 4rem;">
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
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>

<style scoped>
  .v-data-table >>> .v-data-table__wrapper > table > tbody > tr > td,
  .v-data-table >>> .v-data-table__wrapper > table > tbody > tr > th,
  .v-data-table >>> .v-data-table__wrapper > table > thead > tr > td,
  .v-data-table >>> .v-data-table__wrapper > table > thead > tr > th,
  .v-data-table >>> .v-data-table__wrapper > table > tfoot > tr > td,
  .v-data-table >>> .v-data-table__wrapper > table > tfoot > tr > th {
    padding: 0 5px;
  }
</style>
<script>
import FullAlert from './FullAlert'
import addHours from 'date-fns/addHours'
import VueCookies from 'vue-cookies'
import { format, utcToZonedTime } from 'date-fns-tz'
import { mapState } from 'vuex'
import DownloadLog from './DownloadLog'

export default {
  components: {
    FullAlert,
    DownloadLog
  },
  data: function() {
    return {
      headers: [
        { text: '위치', value: 'device.name', align: 'center', sortable: false },
        { text: '가스', value: 'sensor.name', align: 'center', sortable: false },
        { text: '시각', value: 'createdAt', align: 'center', sortable: false },
        { text: '값', value: 'measureModeValue', align: 'center', sortable: false },
        { text: '단계', value: 'measureModeWarnLevel', align: 'center', sortable: false }
      ],
      page: 1,
      pageCount: 0,
      itemsPerPage: 30,
      now: 0,
      end: 0
    }
  },
  async mounted () {
    await this.$store.dispatch('getUserInfoFromCookie');
    await this.$store.dispatch('connectAlertSocket', this.userInfo.userId).then(() => {
      this.$store.state.alert.io.on('newAlert', (data) => {
        this.$store.dispatch('updateAlertList', data);
      });
    })
  },
  destroyed () {
    this.$store.dispatch('emptyAlertList');
    this.$store.dispatch('disconnectAlertSocket');
  },
  computed: {
    ...mapState({
    io: state => state.alert.io,
    main: state => state.alert.main,
    userInfo: state => state.user.userInfo
    }),
    isMobile () {
      if (this.$vuetify.breakpoint.smAndDown)
        return true;
      else
        return false;
    }
  },
  methods: {
    logout () {
      VueCookies.remove('user')
      // redirect to login
      this.$router.push('/login')
      this.$store.dispatch('setSnackBar', { text: '로그아웃 되었습니다.', color: 'green' });
    },
    close () {
      this.$store.dispatch('toggleMainAlertBar');
    },
    firstPage () {
      this.page = 1;
    },
    lastPage () {
      this.page = this.pageCount;
    },
    leftPage () {
      this.page === 1 ? this.page = 1 : this.page--;
    },
    rightPage() {
      this.page === this.pageCount ? this.page = this.pageCount : this.page++;
    },
    reConnect() {
      // remove listener and disconnect alert socket
      this.$store.state.alert.io.off('newAlert');
      this.$store.dispatch('disconnectAlertSocket');
      // empty alert list and re-attach socket
      this.$store.dispatch('emptyAlertList').then(() => {
        this.$store.dispatch('connectAlertSocket', this.userInfo.userId).then(() => {
          this.$store.state.alert.io.on('newAlert', (data) => {
            this.$store.dispatch('updateAlertList', data);
          });
        })
      })
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
        case 1:
          return '주의';
        case 2:
          return '위험';
        case 3:
          return '임계';
        default:
          return 'ERR';
      }
    },
    getColor(level) {
      switch (level) {
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
    }
  }
}
</script>