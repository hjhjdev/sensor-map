import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import ko from 'vuetify/es5/locale/ko';
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify);

export default new Vuetify({
    lang: {
      locales: { ko },
      current: 'ko',
    },
    theme: {
      themes: {
        light: {
          primary: '#3D9DF2',
          secondary: '#5B83A6',
          accent1: '#638CA6',
          accent2: '#F2F2F2',
          accent3: '#0D0D0D',
        }
      }
    }
});
