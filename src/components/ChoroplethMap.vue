<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <!-- <b>Here comes the choropleth map</b>. -->
      <!-- <p>Selected states by clicking on the bar chart: {{ selectedStates }}</p> -->
    </div>
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="map-group" ref="mapGroup"></g>
        <rect class="empty-area" :width="svgWidth" :height="svgHeight"></rect>
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
        bottom: 50,
        left: 100,
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
            return this.getColor(
            this.xScale(d.educationRate),
            this.yScale(d.personalIncome))
            
          }
        })
        .style("stroke", "#fff")
        .style("stroke-width", 1)
        .on("click", (event, d) => this.handleStateClick(d.state));

      d3.select(".empty-area").on("click", () =>
        this.handleStateDeactivation()
      );
    },
    handleStateClick(val) {
      d3.select(`.${val.replace(/ /g, '.')}`).style("stroke-width", 4).style("stroke", "orange");
    },
    handleStateDeactivation() {
      d3.selectAll("circle")
        .data(this.combinedData)
        .attr("fill", (d) => {
          if (!d) return "#ccc";
          return this.getColor(
            this.xScale(d.educationRate),
            this.yScale(d.personalIncome))
        })
        .style("opacity", function (d) {
          return d.filtered ? 0.5 : 1;
        })
        .style("stroke-width", function (d) {
          return d.filtered ? 1 : 2;
        })
        .style("stroke", "#fff");
    },
    getColor(x, y) {
      let rectData = this.rectangularProps;
      let color = "";
      rectData.forEach((element) => {
        if (
          x >= element.x &&
          x <= element.x1 &&
          y <= element.y1 &&
          y >= element.y
        )
          color = element.fill;
      });

      return color;
    },
  },
  computed: {
    rectangularProps: {
      get() {
        return this.$store.getters.rectProps;
      },
    },
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
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      },
    },
    dataMaxEd() {
      return d3.max(this.educationRates, (d) => d.value);
    },
    dataMinEd() {
      return d3.min(this.educationRates, (d) => d.value);
    },
     xScale() {
      return d3
        .scaleLinear()
        .rangeRound([
          0,
          this.svgWidth - this.svgPadding.left - this.svgPadding.right,
        ])
        .domain([this.dataMinEd, this.dataMaxEd]);
    },
    personalIncome: {
      get() {
        return this.$store.getters.personalIncome;
      },
    },
    dataMaxInc() {
      return d3.max(this.personalIncome, (d) => d.value);
    },
    dataMinInc() {
      return d3.min(this.personalIncome, (d) => d.value);
    },
    yScale() {
      return d3
        .scaleLinear()
        .rangeRound([
          this.svgHeight - this.svgPadding.top - this.svgPadding.bottom,
          0,
        ])
        .domain([this.dataMinInc, this.dataMaxInc]);
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
.empty-area {
  opacity: 0;
  /* stroke: rgb(0, 0, 0);
  stroke-width: 1;
  fill: white; */
}
</style>
