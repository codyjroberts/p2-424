d3.json('./data.json', (error, data) => {
  if (error) throw error;

  drawViz(data);
});

function drawViz(data) {
}
