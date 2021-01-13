<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog2"
      persistent
      max-width="800"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          v-on="on"
          color="accent1"
          block
          dark
        >
          위치 설정
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="secondary white--text py-4">
          위치 설정
        </v-card-title>
        <v-card-text class="py-4">
          <div id="setLatLngMap" style="width: 100%; height:400px"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="setDeviceLocation()">선택한 위치로 설정</v-btn>
          <v-btn color="error" text @click="dialog2 = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: ['oldLocation'],
  data () {
    return {
      location: {
        latitude: 0,
        longitude: 0
      },
      dialog2: false
    }
  },
  watch: {
    dialog2: function (val) {
      if (val) {
        this.$nextTick(() => {
          this.initMap();
        });
      }
    }
  },
  methods: {
    initMap() {
      let mapContainer2 = document.getElementById('setLatLngMap')

      let mapOption2 = { 
          center: new kakao.maps.LatLng(37.53958773736656, 126.98298233271616),
          level: 9 // 지도의 확대 레벨
      };

      let map2 = new kakao.maps.Map(mapContainer2, mapOption2); // 지도를 생성합니다

      // vue lifecycle 문제로 생성 후 relayout
      setTimeout(function () { 
        map2.relayout();
        map2.setCenter(new kakao.maps.LatLng(37.53958773736656, 126.98298233271616));
      }, 100);

      let marker;
      
      if (this.oldLocation) {
        console.log('dd')
        // 지도를 클릭한 위치에 표출할 마커입니다
        marker = new kakao.maps.Marker({ 
          // 지도 중심좌표에 마커를 생성합니다 
          position: new kakao.maps.LatLng(this.oldLocation.latitude, this.oldLocation.longitude)
        }); 
      } else {
        marker = new kakao.maps.Marker({ 
          // 지도 중심좌표에 마커를 생성합니다 
          position: new kakao.maps.LatLng(37.53958773736656, 126.98298233271616)
        }); 
      }

      // 지도에 마커를 표시합니다
      marker.setMap(map2);

      // 지도에 클릭 이벤트를 등록합니다
      // 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
      kakao.maps.event.addListener(map2, 'click', (mouseEvent) => {        
      
      // 클릭한 위도, 경도 정보를 가져옵니다 
      let latlng = mouseEvent.latLng; 
      
      // 마커 위치를 클릭한 위치로 옮깁니다
      marker.setPosition(latlng);

      
      this.location.latitude = latlng.getLat();
      this.location.longitude = latlng.getLng();
      });
    },
    setDeviceLocation () {
      this.$emit("newLocation", this.location);
      this.dialog2 = false;
    }
  }
}
</script>