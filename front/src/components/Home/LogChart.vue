<script>
import { Line } from 'vue-chartjs'
import { mapState } from 'vuex'

export default {
  extends: Line,
  props: ['chartName', 'options'],
  data: function() {
    return {
      once: false
    }
  },
  computed: {
    ...mapState({
      chartData (state) {
        return state.log[this.chartName].data
      }
    })
  },
  watch: {
    'chartData.measureModeValue': function () {
      // wait for first data receive
      if (!this.once) {
        this.renderChart(this.chartData, this.options)
        this.once = true;
      } else {
        this.$data._chart.update();
      }
    },
    'chartData': function () {
      this.renderChart(this.chartData, this.options)
    }
  }
}
</script>
