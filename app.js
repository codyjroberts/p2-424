d3.json('./val.json', (error, data) => {
  if (error) throw error;

  drawNeck(data);
});

function drawNeck(data) {
  const svg = d3.select("svg");
  const neckDiv = document.getElementById("neck");

  svg.attr("width", neckDiv.offsetWidth).attr("height", neckDiv.offsetHeight);

  const margin   = {top: 20, right: 45, bottom: 35, left: 35},
    width      = svg.attr("width") - margin.left - margin.right,
    height     = svg.attr("height") - margin.top - margin.bottom,
    valColor   = function (i) { return d3.interpolateLab("#00a9f8", "#ffeb3b")(i); },
    formatYear = d3.timeFormat("%Y"),
    parseTime  = d3.timeParse("%Y"),
    years      = Object.keys(data),
    scaleY     = d3.scaleTime().range([0, height]).interpolate(d3.interpolateRound),
    scaleX     = d3.scaleLinear().range([width, 0]),
    scaleZ     = d3.scaleOrdinal([
      valColor(0.2),
      valColor(0.4),
      valColor(0.6),
      valColor(0.8),
      valColor(1)
    ]), 
    stack = d3.stack()
    .keys(["saddest", "sad", "neutral", "happy", "happiest"]);

  let stacked = stack(Object.entries(data).map(d => {
    return {
      year:     parseTime(d[0]),
      saddest:  d[1].saddest,
      sad:      d[1].sad,
      neutral:  d[1].neutral,
      happy:    d[1].happy,
      happiest: d[1].happiest,
    };
  }));

  let brush = d3.brushY()
    .extent([[0, 0], [width, height]])
    .on("end", brushed);

  let area = d3.area()
    .curve(d3.curveNatural)
    .y((d, i) => { return scaleY(d.data.year); })
    .x0(d => { return scaleX(d[0]); })
    .x1(d => { return scaleX(d[1]); });

  let g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  scaleX.domain([1, 0]);
  scaleY.domain([parseTime("1956"), parseTime("2015")]);
  scaleZ.domain(["saddest", "sad", "neutral", "happy", "happiest"])

  let layer = g.selectAll(".layer")
    .data(stacked)
    .enter().append("g")
    .attr("class", "layer")

  layer.append("path")
    .attr("class", "area")
    .attr("class", "thing")
    .style("fill", d => {
      return scaleZ(d.key);
    })
    .attr("d", area);

  // Axes
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3.axisBottom(scaleX)
      .tickArguments([10, "%"])
      .tickSize(-height)
      .tickFormat((d) => {
        if (d == 0 || d == 1)
          return '';
        else
          return `${Math.round(d * 100)}%`;
      })
    );

  g.append("g")
    .attr("class", "axis axis--grid")
    .attr("transform", `translate(${width},0)`)
    .call(d3.axisRight(scaleY).ticks(years.length).tickSize(-width))

  // Axis Labels
  svg.append("text")
    .attr("font-size", "0.8em")
    .attr("text-anchor", "start")
    .attr("transform", `translate(${margin.left}, ${height + 50})`)
    .text("Saddest");

  svg.append("text")
    .attr("font-size", "0.8em")
    .attr("text-anchor", "end")
    .attr("transform", `translate(${width + margin.left}, ${height + 50})`)
    .text("Happiest");

  // Brush
  layer.append("g")
    .attr("class", "brush")
    .call(brush)


  function brushed() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    d3.selectAll(".focus").remove();
    d3.selectAll(".axis--grid").selectAll("text").style("opacity", 1);
    if (!d3.event.selection) return;
    var y0 = d3.event.selection.map(scaleY.invert),
      y1 = y0.map(d3.timeYear.round);

    // If empty when rounded, use floor & ceil instead.
    if (y1[0] >= y1[1]) {
      y1[0] = d3.timeYear.floor(y0[0]);
      y1[1] = d3.timeYear.offset(y1[0]);
    }

    d3.select(this).transition().call(d3.event.target.move, y1.map(scaleY));

    showPoints(formatYear(y1[0]), formatYear(y1[1]));
  }

  function showPoints(y0, y1) {
    function* range (begin, end, interval = 1) {
      for (let i = begin; i <= end; i += interval) {
        yield i;
      }
    }

    d3.selectAll(".axis--grid").selectAll("text")._groups[0].forEach(x => {
      if (parseInt(x.innerHTML) < y0 || parseInt(x.innerHTML) > y1 ) {
        d3.select(x).style("opacity", 0.3);
      }
    });

    for (i of range(parseInt(y0), parseInt(y1), 1)) {
      var yr = parseTime(i.toString());

      let vals = [
        data[formatYear(yr)].saddest,
        data[formatYear(yr)].sad,
        data[formatYear(yr)].neutral,
        data[formatYear(yr)].happy,
        data[formatYear(yr)].happiest
      ]

      vals.forEach((x, idx) =>  {
        let offset = vals.slice(idx).reduce((prev, curr) => prev + curr);
        let x0 = width - scaleX(offset);
        let textOffset;

        let f1 = svg.append("g")
          .attr("class", "focus")
          .style("display", null);


        if (document.getElementById("valuesCheck").checked)
          f1.style("opacity", 1);
        else
          f1.style("opacity", 0);

        idx == 0 ? textOffset = -3 : textOffset = 3;

        f1.append("text")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          .attr("x", textOffset)
          .attr("text-anchor", () => {
            if (idx == 0) 
              return "end"
            else
              return "start"
          })
          .attr("font-size", "0.8em")

        f1.attr("transform", "translate(" + x0 + "," + scaleY(d3.timeYear.floor(yr)) + ")");
        f1.select("text").text(`${Math.round(x * 100)}%`);
      });
    }
  }

  d3.select("input").on("change", toggleValues);

  let sortTimeout = setTimeout(() => {
    d3.select("input").property("checked", true).each(toggleValues);
  }, 1000);

  function toggleValues() {
    clearTimeout(sortTimeout);
    if (this.checked)
      d3.selectAll(".focus").style("opacity", 1);
    else
      d3.selectAll(".focus").style("opacity", 0);
  }
}
