<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <!-- <b>Here comes the scatterplot</b>. -->
      <!-- <p>Education Attainment Rate for the Selected Year: {{ educationRates }}</p> -->
    </div>
    <svg class="main-svg" :width="svgWidth" :height="svgHeight">
      <g class="chart-group" ref="chartGroup">
        <g class="axis axis-x" ref="axisX"></g>
        <g class="axis axis-y" ref="axisY"></g>
        <g class="rects-group" ref="rects"></g>
        <g class="circles-group" ref="circles"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Scatterplot",
  props: {},
  data() {
    return {
      n: 3,
      colors: [
        "#e8e8e8",
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
    this.drawScatterPlot();
    
  },
  methods: {
    drawScatterPlot() {
      if (this.$refs.chart) this.svgWidth = this.$refs.chart.clientWidth;
      d3.select(this.$refs.chartGroup).attr(
        "transform",
        `translate(${this.svgPadding.left},${this.svgPadding.top})`
      );
      this.drawRects();
      this.drawCircles();
      this.drawXAxis();
    this.drawYAxis();
    },
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .call(d3.axisBottom(this.xScale))
        .append("text")
        .attr("y", 40)
        .attr("x", this.svgWidth / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text("Educational Attainment: Bachelor's Degree or Higher (%)");
    },
    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale).tickFormat(d3.format("$.2s")))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Average Personal Yearly Income");
    },
    drawRects() {
      const rectGroup = d3.select(this.$refs.rects);
      //third attempt

      let rectData = [];

      d3.cross(d3.range(this.n), d3.range(this.n)).map(([i, j]) => {
        rectData.push({
          width: this.svgWidth/9,
          height: this.svgWidth/9,
          x: (i * (this.svgWidth/9)),
          y: this.svgWidth - this.n - 1 - j*this.svgWidth/9 - 200,
          fill: this.colors[j * this.n + i],
        });
      });

      rectGroup
        .selectAll("rect")
        .data(
          rectData
        )
        .enter()
        .append("rect")
        .attr("x", (d) => d.x)
        .attr(
          "width",
           (d) => d.width
        )
        .attr("y", (d) => d.y
        )
        .attr("height", (d) => d.height)
        .style("fill", (d) => d.fill);
    },

    drawCircles() {
      const circlesGroup = d3.select(this.$refs.circles);
      circlesGroup
        .selectAll(".circle")
        .data(this.combinedData)
        // .exit().remove()
        .enter()
        .append("circle")
        .attr("r", 4)
        .style("stroke", "#fff")
        .attr("cx", (d) => {
          return this.xScale(d[1]);
        })
        .attr("cy", (d) => this.yScale(d[0]))
        .style("fill", (d) => {
          if (!d) return "#ccc";
          let [a, b] = [d[0], d[1]];
          return this.colors[this.y(b) + this.x(a) * this.n];
        });
      // .style("opacity", function (d) {
      //   console.log(d.filtered);

      //   return d.filtered ? 0.5 : 1;
      // })
      // .style("stroke-width", function (d) {
      //   return d.filtered ? 1 : 2;
      // });
    },
  },
  computed: {
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
        .domain([this.dataMinEd - 1, this.dataMaxEd]);
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
        .domain([this.dataMinInc - 2000, this.dataMaxInc]);
    },
    combinedData: {
      get() {
        return this.$store.getters.combinedData;
      },
    },
    x() {
      return d3.scaleQuantile(
        Array.from(this.combinedData, (d) => d[0]),
        d3.range(this.n)
      );
    },
    y() {
      return d3.scaleQuantile(
        Array.from(this.combinedData, (d) => d[1]),
        d3.range(this.n)
      );
    },
  },
  watch: {
    combinedData: {
      handler() {
        this.drawScatterPlot();
      },
      deep: true,
    },
  },
};
</script>

<style>
</style>
