function App() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
      );
      const json = await response.json();
      setData(json.data);
    }

    fetchData();
  }, []);

  return (
    <div className="bg-gray-100 h-screen flex flex-col justify-center items-center">
      <h1 id="title" className="text-3xl font-bold mb-4">
        United States GDP
      </h1>
      <div className="text-lg text-gray-600 mb-8">1947-2021</div>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <BarChart data={data} />
      </div>
    </div>
  );
}

function BarChart({ data }) {
  const svgRef = React.useRef(null);

  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  React.useEffect(() => {
    if (data.length > 0) {
      const svg = d3.select(svgRef.current);

      const x = d3
        .scaleTime()
        .domain([
          new Date(data[0][0]), // ใช้วันแรกของข้อมูลเป็นจุดเริ่มต้นของแกน x
          new Date(data[data.length - 1][0])
        ])
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([
          0, // ให้แกน y เริ่มต้นที่ 0
          d3.max(data, (d) => d[1])
        ])
        .range([height, 0]);

      const xAxis = d3.axisBottom(x);
      const yAxis = d3.axisLeft(y);

      svg.selectAll("*").remove();

      svg
        .append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${margin.left},${margin.top})`)
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.78em")
        .attr("text-anchor", "end")
        .text("Billions of Dollars");

      svg
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${margin.left},${height + margin.top})`)
        .call(xAxis);

      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.top + 30)
        .style("text-anchor", "middle")
        .text("Year");

      svg
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("data-date", (d) => d[0])
        .attr("data-gdp", (d) => d[1])
        .attr("x", (d) => x(new Date(d[0])))
        .attr("y", (d) => y(d[1]))
        .attr("width", width / data.length)
        .attr("height", (d) => height - y(d[1]))
        .attr("class", "bar")
        .on("mouseover", function (event, d) {
          const i = this.getAttribute("index");

          d3.select(this).classed("active", true);

          const tooltip = d3.select("#tooltip");
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              d[0] +
                "<br>" +
                "$" +
                d[1].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,") +
                " Billion"
            )
            .attr("data-date", d[0])
            .style("left", i * (width / data.length) + "px")
            .style("top", height - 100 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).classed("active", false);

          const tooltip = d3.select("#tooltip");
          tooltip.transition().duration(200).style("opacity", 0);
        });

      // สร้างเส้นกราฟเส้น
      const line = d3
        .line()
        .x((d) => x(new Date(d[0])))
        .y((d) => y(d[1]));

      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr(
          "d",
          line(data)
        );
    }
  }, [data]);

  return (
    <div className="flex items-center justify-center mt-10">
      <div className="bg-blue-500 p-4 rounded-lg shadow-lg">
        <svg
          ref={svgRef}
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
        ></svg>
      </div>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
