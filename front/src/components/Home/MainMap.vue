<template>
  <v-card flat class="map_wrap" style="height:100%">
    <div id="map" style="height:100%"></div>
  </v-card>
</template>
<script>
import Vue from 'vue'
import { mapState } from 'vuex'

export default {
  data: function () {
    return {
      markerUpdateTimer: null
    }
  },
  mounted () {
    window.kakao && window.kakao.maps ? this.initMap() : this.addScript();
  },
  destroyed () {
    this.$store.dispatch('emptyMarkerList')
  },
  computed: mapState({
    userInfo: state => state.user.userInfo
  }),
  methods : {
    initMap() {
      let container = document.getElementById('map');
      let options = { 
        center: new kakao.maps.LatLng(37.53958773736656, 126.98298233271616),
        level: 8
      };

      this.$store.dispatch('loadMap', { container, options });
      // device 로딩 후 마커 추가
      this.initInfo();
    },
    addScript() {
      const script = document.createElement('script');
      // global kakao
      script.onload = () => kakao.maps.load(this.initMap);
      script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=42a93f1f989c0feb4c6f95522ec908d1&autoload=false';
      document.head.appendChild(script);
    },
    initInfo () {
      // get device list
      // empty list first
      this.$store.dispatch('getDeviceList').then(() => {
        for (let i = 0; i < this.$store.state.device.list.length; i++) {
          // then add markers
          this.addMarker(this.$store.state.device.list[i]);
        }

        this.$store.dispatch('connectMapSocket', this.userInfo.userId).then(() => {
          this.$store.state.map.io.on('newData', (data) => {
            this.$store.dispatch('editMarkerColor', data);
          });
        })
      }).catch(error => {
        console.log(error);
        alert('서버 오류가 발생했습니다.');
      })
    },
    addMarker (data) {
      this.$store.dispatch('addMarker', {
        deviceId: data.deviceId,
        latitude: data.latitude,
        longitude: data.longitude
      });
    }
  },
  destroyed () {
    // stop update when visiting another page
    this.$store.dispatch('disconnectMapSocket');
    this.$store.dispatch('emptyMarkerList');
    this.$store.dispatch('emptyDeviceList');
    this.$store.dispatch('unloadMap');
  }
}
</script> 