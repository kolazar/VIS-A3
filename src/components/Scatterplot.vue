<template>
  <div class="vis-component" ref="chart">
    <div class="placeholder">
      <!-- <b>Here comes the scatterplot</b>.
      <p>
        Education Attainment Rate for the Selected Year: {{ educationRates }}
      </p> -->

      <svg class="main-svg" :width="svgWidth" :height="svgHeight">
        <g class="chart-group" ref="chartGroup">
          <g class="axis axis-x" ref="axisX"></g>
          <g class="axis axis-y" ref="axisY"></g>
          <g class="rects-group" ref="rects"></g>
          <g class="circles-group" ref="circles"></g>
        </g>
      </svg>
    </div>
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
      this.drawXAxis();
      this.drawYAxis();
      this.drawRects();
      this.drawCircles();
    },
    drawXAxis() {
      d3.select(this.$refs.axisX)
        .attr(
          "transform",
          `translate( 0, ${
            this.svgHeight - this.svgPadding.top - this.svgPadding.bottom
          } )`
        )
        .call(d3.axisBottom(this.xScale).tickFormat((d) => d + "%"))
        .raise()
        .append("text")
        .attr("y", 40)
        .attr("x", this.svgWidth / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "black")
        .text("Educational Attainment: Bachelor's Degree or Higher");
    },
    drawYAxis() {
      d3.select(this.$refs.axisY)
        .call(d3.axisLeft(this.yScale).tickFormat(d3.format("$.2s")))
        .raise()
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -6)
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .attr("fill", "black")
        .text("Average Personal Yearly Income");
    },
    drawRects() {
      let rectGroup = d3.select(this.$refs.rects);

      rectGroup
        .selectAll("rect")
        .data(this.rectangularProps)
        .enter()
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("width", (d) => d.width)
        .attr("y", (d) => d.y)
        .attr("height", (d) => d.height)
        .style("fill", (d) => d.fill);
    },

    drawCircles() {
      let tooltip = d3
        .select(".placeholder")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "0.5px")
        .style("border-radius", "3px")
        .style("padding", "8px");

      let circlesGroup = d3
        .select(this.$refs.circles)
        .selectAll("circle")
        .data(this.combinedData);

      circlesGroup.exit().remove();

      circlesGroup
        .enter()
        .append("circle")
        .attr("r", 4)
        .style("stroke", "#fff")
        .merge(circlesGroup)
        .attr("cx", (d) => {
          return this.xScale(d[1]);
        })
        .attr("cy", (d) => this.yScale(d[0]));

      circlesGroup
        .data(this.educationRates)
        .on("mouseover", () => tooltip.style("opacity", 1))
        .on("mousemove", (event, d) => {
          const [xm, ym] = d3.pointer(event);
          return tooltip
            .html(d.state)
            .style("left", xm - 5 + "px")
            .style("top", ym - 10 + "px");
        })
        .on("mouseleave", () =>
          tooltip.transition().duration(250).style("opacity", 0)
        );

      // .style("fill", (d) => {
      //   if (!d) return "#ccc";
      //   let [a, b] = [d[0], d[1]];
      //   return this.colors[this.y(b) + this.x(a) * this.n];
      // });
      // .style("opacity", function (d) {
      //   console.log(d.filtered);

      //   return d.filtered ? 0.5 : 1;
      // })
      // .style("stroke-width", function (d) {
      //   return d.filtered ? 1 : 2;
      // });
    },
    handleCircleMouseHover(val) {
      this.$store.commit("changeSelectedState", val);
    },
    handleCircleMouseOut() {
      this.$store.commit("removeState");
    },
  },
  computed: {
    selectedStates: {
      get() {
        return this.$store.getters.selectedStates;
      },
    },
    educationRates: {
      get() {
        return this.$store.getters.educationRates;
      },
    },
    dataMaxEd() {
      return d3.max(this.educationRates, (d) => d.value + 2);
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
      return d3.max(this.personalIncome, (d) => d.value + 2000);
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
    rectangularProps() {
      let rectData = [];
      let plotAreaWidth =
        this.svgWidth - this.svgPadding.left - this.svgPadding.right;
      let plotAreaHeight =
        this.svgHeight - this.svgPadding.top - this.svgPadding.bottom;

      //Calculating properties for the rectangles
      d3.cross(d3.range(this.n), d3.range(this.n)).map(([i, j]) => {
        rectData.push({
          width: plotAreaWidth / 3,
          height: plotAreaHeight / 3,
          x: i * (plotAreaWidth / 3),
          y: (this.n - 1 - j) * (plotAreaHeight / 3),
          fill: this.colors[j * this.n + i],
        });
      });
      return rectData;
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
