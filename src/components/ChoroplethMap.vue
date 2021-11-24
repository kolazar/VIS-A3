<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <!-- <b>Here comes the choropleth map</b>. -->
      <!-- <p>Selected states by clicking on the bar chart: {{ selectedStates }}</p> -->
    </div>
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="map-group" ref="mapGroup"></g>
        <rect class ="empty-area" :width="svgWidth" :height="svgHeight"> </rect>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import mapStatesUSA from "@/assets/us-states-geo.json";

export default {
  name: "ChoroplethMap",
  props: {},
  data() {
    return {
      n: 3,
      colors: [
        "#b3b2b2",
        "#e4acac",
        "#c85a5a",
        "#b0d5df",
        "#ad9ea5",
        "#985356",
        "#64acbe",
        "#627f8c",
        "#574249",
      ],
      svgWidth: 500,
      svgHeight: 500,
      svgPadding: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    };
  },
  mounted() {
    this.drawMap();
  },
  methods: {
    drawMap() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;

      let projection = d3
        .geoAlbersUsa()
        .scale([this.svgWidth * 1.1])
        .translate([this.svgWidth / 2.1, this.svgHeight / 2.1]);

      let path = d3.geoPath().projection(projection);

      d3.select(this.$refs.chartGroup)
        .attr(
          "transform",
          `translate(${this.svgPadding.left},${this.svgPadding.top})`
        )
        .selectAll("path")
        .data(mapStatesUSA.features)
        .join("path")
        .attr("d", path)
        .data(this.combinedData)
        .attr("fill", (d) => {
          if (!d) {
            return "#ccc";
          } else {
            if (d.filtered) {
              return "#ddd";
            }

            let [a, b] = [d.personalIncome, d.educationRate];
            return this.colors[this.y(b) + this.x(a) * this.n];
          }
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .on("click", (event, d) => this.handleStateClick(d.state));

      d3.select(".empty-area").on("click", () => this.handleStateDeactivation());
    },
    handleStateClick(val) {
      d3.select(`.${val}`).attr("fill", "red");
    },
    handleStateDeactivation() {
      d3.selectAll("circle").attr("fill", "black");
    },
  },
  computed: {
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
    combinedData: {
      get() {
        return this.$store.getters.combinedData;
      },
    },
    x() {
      return d3.scaleQuantile(
        Array.from(this.combinedData, (d) => d.personalIncome),
        d3.range(this.n)
      );
    },
    y() {
      return d3.scaleQuantile(
        Array.from(this.combinedData, (d) => d.educationRate),
        d3.range(this.n)
      );
    },
  },
  watch: {
    combinedData: {
      handler() {
        this.drawMap();
      },
      deep: true,
    },
  },
};
</script>

<style>
.empty-area{
  opacity: 0;
}
</style>
