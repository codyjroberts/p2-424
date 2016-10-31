d3.json('./val.json', (error, data) => {
  if (error) throw error;

  drawNeck(data);
});

d3.json("./valtotals.json", (error, data) => {
  if (error) throw error;

  drawHisto(data);
});

const valColor   = function (i) { return d3.interpolateLab("#00a9f8", "#ffeb3b")(i); };

function drawNeck(data) {
  const svg = d3.select("#stacked");
  const neckDiv = document.getElementById("viz-right");

  svg.attr("width", neckDiv.offsetWidth).attr("height", neckDiv.offsetHeight);

  const margin   = {top: 20, right: 45, bottom: 35, left: 35},
    width      = svg.attr("width") - margin.left - margin.right,
    height     = svg.attr("height") - margin.top - margin.bottom,
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
    .attr("text-anchor", "middle")
    .attr("transform", `translate(${(width / 2 ) + margin.left}, ${height + 50})`)
    .text("Valence by Category");

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
    updateHisto(1956, 2015);
    if (!d3.event.selection) return;

    let y0 = d3.event.selection.map(scaleY.invert);
    let y1 = y0.map(d3.timeYear.round);

    // If empty when rounded, use floor & ceil instead.
    if (y1[0] >= y1[1]) {
      y1[0] = d3.timeYear.floor(y0[0]);
      y1[1] = d3.timeYear.offset(y1[0]);
    }

    d3.select(this).transition().call(d3.event.target.move, y1.map(scaleY));

    showPoints(formatYear(y1[0]), formatYear(y1[1]));

    let yrFrom = parseInt(formatYear(y1[0]));
    let yrTo   = parseInt(formatYear(y1[1]));
    
    updateHisto(yrFrom, yrTo);
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

    if (this.checked) {
      d3.selectAll(".focus").style("opacity", 1);
      d3.selectAll(".histoText").style("opacity", 1);
    }
    else {
      d3.selectAll(".focus").style("opacity", 0);
      d3.selectAll(".histoText").style("opacity", 0);
    }
  }
}

let histo = {
  hstArr: new Array(60),
  hpyArr: new Array(60),
  neuArr: new Array(60),
  sadArr: new Array(60),
  sstArr: new Array(60),
  hstTot: 0,
  hpyTot: 0,
  neuTot: 0,
  sadTot: 0,
  sstTot: 0
}

function drawHisto(data) {
  let i = 0;
  for (; i < 60; i++) {
    histo.hstArr[i] = 0;
    histo.hpyArr[i] = 0;
    histo.neuArr[i] = 0;
    histo.sadArr[i] = 0;
    histo.sstArr[i] = 0;
  }

  for (d of data) {
    insert_data(d);
  }

  function insert_data(d) {		// insert data into arrays
    histo.hstArr[d.year-1956] += d.happiest;
    histo.hstTot += d.happiest;
    histo.hpyArr[d.year-1956] += d.happy;
    histo.hpyTot += d.happy;
    histo.neuArr[d.year-1956] += d.neutral;
    histo.neuTot += d.neutral;
    histo.sadArr[d.year-1956] += d.sad;
    histo.sadTot += d.sad;
    histo.sstArr[d.year-1956] += d.saddest;
    histo.sstTot += d.saddest;
  }

  let width = 250, height = 200;

  let svg = d3.select("#histo")
    .attr("width", width)
    .attr("height", height);

  let happiestBack = svg.append("rect")
    .attr("id", "happiestBack")
    .attr("x",0)
    .attr("y",0)
    .attr("width",width)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(1))
    .style("opacity",0.5);

  let happyBack = svg.append("rect")
    .attr("id", "happyBack")
    .attr("x",0)
    .attr("y",height*.2)
    .attr("width",width)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.8))
    .style("opacity",0.5);

  let neutralBack = svg.append("rect")
    .attr("id", "neutralBack")
    .attr("x",0)
    .attr("y",height*.4)
    .attr("width",width)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.6))
    .style("opacity",0.5);

  let sadBack = svg.append("rect")
    .attr("id", "sadBack")
    .attr("x",0)
    .attr("y",height*.6)
    .attr("width",width)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.4))
    .style("opacity",0.5);

  let saddestBack = svg.append("rect")
    .attr("id", "saddestBack")
    .attr("x",0)
    .attr("y",height*.8)
    .attr("width",width)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.2))
    .style("opacity",0.5);

  let happiestFront = svg.append("rect")
    .attr("id", "happiestFront")
    .attr("x",0)
    .attr("y",0)
    .attr("width",0)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(1));

  let happyFront = svg.append("rect")
    .attr("id", "happyFront")
    .attr("x",0)
    .attr("y",height*.2)
    .attr("width",0)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.8));

  let neutralFront = svg.append("rect")
    .attr("id", "neutralFront")
    .attr("x",0)
    .attr("y",height*.4)
    .attr("width",0)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.6));

  let sadFront = svg.append("rect")
    .attr("id", "sadFront")
    .attr("x",0)
    .attr("y",height*.6)
    .attr("width",0)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.4));

  let saddestFront = svg.append("rect")
    .attr("id", "saddestFront")
    .attr("x",0)
    .attr("y",height*.8)
    .attr("width",0)
    .attr("height",height*.2)
    .attr("stroke","white")
    .attr("stroke-width",3)
    .attr("fill", valColor(0.2));

  let hstText = svg.append("text")
    .attr("id", "hstText")
    .attr("class", "histoText")
    .attr("x",3)
    .attr("y",height*.12);

  let hpyText = svg.append("text")
    .attr("id", "hpyText")
    .attr("class", "histoText")
    .attr("x",3)
    .attr("y",height*.32);

  let neuText = svg.append("text")
    .attr("id", "neuText")
    .attr("class", "histoText")
    .attr("x",3)
    .attr("y",height*.52);

  let sadText = svg.append("text")
    .attr("id", "sadText")
    .attr("class", "histoText")
    .attr("x",3)
    .attr("y",height*.72);

  let sstText = svg.append("text")
    .attr("id", "sstText")
    .attr("class", "histoText")
    .attr("x",3)
    .attr("y",height*.92);

  updateHisto(1956, 2015);
}

function updateHisto(start, end) {
  let hstBuf = 0,
    hstW     = 0,
    hpyBuf   = 0,
    hpyW     = 0,
    neuBuf   = 0,
    neuW     = 0,
    sadBuf   = 0,
    sadW     = 0,
    sstBuf   = 0,
    sstW     = 0,
    width    = 250,
    height   = 200,
    x        = 1956;

  while(x < start) {
    hstBuf += histo.hstArr[x-1956];
    hpyBuf += histo.hpyArr[x-1956];
    neuBuf += histo.neuArr[x-1956];
    sadBuf += histo.sadArr[x-1956];
    sstBuf += histo.sstArr[x-1956];
    x += 1;
  }

  while(x <= end) {
    hstW += histo.hstArr[x-1956];
    hpyW += histo.hpyArr[x-1956];
    neuW += histo.neuArr[x-1956];
    sadW += histo.sadArr[x-1956];
    sstW += histo.sstArr[x-1956];
    x += 1;
  }

  d3.select("#happiestFront")
    .transition()
    .duration(250)
    .attr("x", width*hstBuf/histo.hstTot)
    .attr("width", width*hstW/histo.hstTot);

  d3.select("#happyFront")
    .transition()
    .duration(250)
    .attr("x", width*hpyBuf/histo.hpyTot)
    .attr("width", width*hpyW/histo.hpyTot);

  d3.select("#neutralFront")
    .transition()
    .duration(250)
    .attr("x", width*neuBuf/histo.neuTot)
    .attr("width", width*neuW/histo.neuTot);

  d3.select("#sadFront")
    .transition()
    .duration(250)
    .attr("x", width*sadBuf/histo.sadTot)
    .attr("width", width*sadW/histo.sadTot);

  d3.select("#saddestFront")
    .transition()
    .duration(250)
    .attr("x", width*sstBuf/histo.sstTot)
    .attr("width", width*sstW/histo.sstTot);

  let trans = d3.transition().duration(250);

  let hstText = d3.select("#hstText").transition(trans);
  let hpyText = d3.select("#hpyText").transition(trans);
  let neuText = d3.select("#neuText").transition(trans);
  let sadText = d3.select("#sadText").transition(trans);
  let sstText = d3.select("#sstText").transition(trans);

  hstText.text(((hstW/histo.hstTot*100).toFixed(0)).toString().concat("%"));
  hpyText.text(((hpyW/histo.hpyTot*100).toFixed(0)).toString().concat("%"));
  neuText.text(((neuW/histo.neuTot*100).toFixed(0)).toString().concat("%"));
  sadText.text(((sadW/histo.sadTot*100).toFixed(0)).toString().concat("%"));
  sstText.text(((sstW/histo.sstTot*100).toFixed(0)).toString().concat("%"));

  if (width*hstW/histo.hstTot >= 35) {
    hstText.attr("x", width*hstBuf/histo.hstTot + 3);
  } else if (width - width*hstBuf/histo.hstTot - width*hstW/histo.hstTot < 35) {
    hstText.attr("x", width*hstBuf/histo.hstTot - 35);
  } else {
    hstText.attr("x", width*hstBuf/histo.hstTot + width*hstW/histo.hstTot + 3);
  }

  if (width*hpyW/histo.hpyTot >= 35) {
    hpyText.attr("x", width*hpyBuf/histo.hpyTot + 3);
  } else if (width - width*hpyBuf/histo.hpyTot - width*hpyW/histo.hpyTot < 35) {
    hpyText.attr("x", width*hpyBuf/histo.hpyTot - 35);
  } else {
    hpyText.attr("x", width*hpyBuf/histo.hpyTot + width*hpyW/histo.hpyTot + 3);
  }

  if (width*neuW/histo.neuTot >= 35) {
    neuText.attr("x", width*neuBuf/histo.neuTot + 3);
  } else if (width - width*neuBuf/histo.neuTot - width*neuW/histo.neuTot < 35) {
    neuText.attr("x",  width*neuBuf/histo.neuTot - 35);
  } else {
    neuText.attr("x", width*neuBuf/histo.neuTot + width*neuW/histo.neuTot + 3);
  }

  if (width*sadW/histo.sadTot >= 35) {
    sadText.attr("x", width*sadBuf/histo.sadTot + 3);
  } else if (width - width*sadBuf/histo.sadTot - width*sadW/histo.sadTot < 35) {
    sadText.attr("x", width*sadBuf/histo.sadTot - 35);
  } else {
    sadText.attr("x", width*sadBuf/histo.sadTot + width*sadW/histo.sadTot + 3);
  }

  if (width*sstW/histo.sstTot >= 35) {
    sstText.attr("x", width*sstBuf/histo.sstTot + 3);
  } else if (width - width*sstBuf/histo.sstTot - width*sstW/histo.sstTot < 35) {
    sstText.attr("x", width*sstBuf/histo.sstTot - 35);
  } else {
    sstText.attr("x", width*sstBuf/histo.sstTot + width*sstW/histo.sstTot + 3);
  }
}

let diameter = 960,
    radius = diameter / 2,
    innerRadius = radius - 120;

let svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

let cluster = d3.cluster()
    .size([360, innerRadius])

let line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.95))
    .radius(d => { return d.y; })
    .angle(d => { return d.x / 180 * Math.PI; });

let link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

function update(file) {
    d3.json(file, (error, classes) => {
      if (error) throw error;
      // remove previous data
      
      d3.selectAll(".node").remove();
      d3.selectAll(".link").remove();
      
      // package data into hierarchy format
      
      let hierarchy = d3.hierarchy(packageHierarchy(classes))
      let nodes = cluster(hierarchy).descendants()

      let links = packageSongs(nodes);

      // Generate nodes with song names around radius
      let node_selection = node.data(nodes.filter(n => { return !n.data.children; }));
      node_selection    
          .enter().append("text")
          .attr("class", "node")
          .attr("dy", ".34em")
          .attr("transform", d => { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
          .style("text-anchor", d => { return d.x < 180 ? "start" : "end"; })
          .text(d => { return d.data.key; })

      // Create path connect the target and source nodes and color the path based on valence
      let link_selection = link.data(links);
      link_selection
            .enter().append('path')
            .attr('class', 'link')
            .merge(link)
            .attr('d', d => line(d.source.path(d.target)))
            .attr("stroke-dasharray", function() {
                let totalLength = this.getTotalLength();
                return totalLength + " " + totalLength;
            })
            .attr("stroke-dashoffset", function() {
                let totalLength = this.getTotalLength();
                return totalLength;
            })
            .style("stroke", d => d3.interpolateLab("#00a9f8 ", "#ffeb3b ")(d.valence))
            .style("stroke-width", 2)
            .transition()
                .duration(2000)
                .attr("stroke-dashoffset", 0);
      
    });
  

}

update("xing-test/test2.json");
update("xing-test/readme-flare-imports.json");
  
// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  let map = {};

  function find(name, data) {
    let node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(d => {
    find(d.name, d);
  });

  return map[""];
}

// Return a list of songs for the given array of nodes.
function packageSongs(nodes) {
  let map = {},
      imports = [],
      valence = {};

  // Compute a map from name to node.
  nodes.forEach(d => {
    map[d.data.name] = d;
    valence[d.data.name] = d.data.valence;
  });

  // For each song, construct a link from the source to target node.
  nodes.forEach(d => {
    if (d.data.songs) d.data.songs.forEach(i => {
      imports.push({source: map[d.data.name], target: map[i], valence: valence[d.data.name]});
    });
  });

  return imports;
}

