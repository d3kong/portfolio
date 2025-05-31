console.log("Script loaded!");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let commitProgress = 100;
let filteredCommits = [];
const timeSlider = d3.select("#timeSlider").node();
const selectedTime = d3.select("#selectedTime");

function highlightStep(i) {
  if (sortedCommits && sortedCommits[i]) {
    const targetDate = sortedCommits[i].datetime;
    commitProgress = Math.round(timeScale(targetDate));
    timeSlider.value = commitProgress;
    updateTimeDisplay();
  }

  if (i === 0) {
    svg.selectAll("circle")
      .attr("fill", "lightgray")
      .attr("r", 2);
  } else if (i === 1) {
    const biggest = d3.max(filteredCommits, d => d.lines);
    svg.selectAll("circle")
      .attr("fill", d => (d.lines === biggest ? "crimson" : "lightgray"))
      .attr("r", d => (d.lines === biggest ? 6 : 2));
  } else if (i === 2) {
    svg.selectAll("circle")
      .attr("fill", d => (d.lines > 10 ? "gold" : "lightgray"))
      .attr("r", d => (d.lines > 10 ? 6 : 2));
  } else if (i === 3) {
    svg.selectAll("circle")
      .attr("fill", "steelblue")
      .transition()
      .duration(500)
      .attr("r", 4);
  } else if (i === 4) {
    const lastDate = d3.max(filteredCommits, d => d.datetime);
    svg.selectAll("circle")
      .attr("fill", d => (d.datetime.getTime() === lastDate.getTime() ? "purple" : "lightgray"))
      .attr("r", d => (d.datetime.getTime() === lastDate.getTime() ? 6 : 2));
  } else {
    svg.selectAll("circle")
      .attr("fill", "steelblue")
      .attr("r", 4);
  }
}

let svg,
    timeScale,
    commits,
    sortedCommits;

async function loadData() {
  const prefix = location.hostname === "localhost" ? "" : "/portfolio";
  const data = await d3.csv(`${prefix}/meta/loc.csv`, row => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));

  commits = d3.rollups(
    data,
    v => ({ datetime: v[0].datetime, lines: v.length }),
    d => d.commit
  ).map(([commit, info]) => ({ commit, ...info }));

  commits.sort((a, b) => a.datetime - b.datetime);
  sortedCommits = commits.slice(); 

  const width = 800,
        height = 400,
        margin = { top: 20, right: 20, bottom: 30, left: 40 };

  svg = d3.select("#chart-evolution svg")
    .attr("width", width)
    .attr("height", height);

  // Draw grid and axes
  const x = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(commits, d => d.lines)])
    .range([height - margin.bottom, margin.top]);

  const yAxisGrid = d3.axisLeft(y)
    .tickSize(-width + margin.left + margin.right)
    .tickFormat("");

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxisGrid);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  timeScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, 100]);

  function updateCommitMaxTime() {
    return timeScale.invert(commitProgress);
  }

  function updateScatterPlot(filtered) {
    const circles = svg.selectAll("circle").data(filtered, d => d.commit);

    // EXIT old
    circles.exit().remove();

    // ENTER new
    circles.enter()
      .append("circle")
      .attr("cx", d => x(d.datetime))
      .attr("cy", d => y(d.lines))
      .attr("r", 0)                      
      .attr("fill", "steelblue")
      .transition()                      
      .duration(500)
      .attr("r", 4);

    circles
      .attr("cx", d => x(d.datetime))
      .attr("cy", d => y(d.lines))
      .attr("fill", "steelblue")
      .attr("r", 4);
  }

  function renderFiles() {
    const cutoff = updateCommitMaxTime();
    const subset = data.filter(d => d.datetime <= cutoff);

    let files = d3.groups(subset, d => d.file)
      .map(([name, rows]) => ({ name, lines: rows }));

    files.sort((a, b) => b.lines.length - a.lines.length);

    const filesContainer = d3.select(".files");
    filesContainer.selectAll("div").remove();

    const fileBlocks = filesContainer.selectAll("div")
      .data(files)
      .enter()
      .append("div");

    fileBlocks.append("dt")
      .append("code")
      .text(d => d.name);

    fileBlocks.append("dd")
      .selectAll("div")
      .data(d => d.lines)
      .join("div")
      .attr("class", "line")
      .style("background", d => fileTypeColors(d.tech));
  }

  const fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);
  const techs = Array.from(new Set(data.map(d => d.tech))).filter(Boolean);
  const legend = d3.select(".legend");
  legend.selectAll("li")
    .data(techs)
    .enter()
    .append("li")
    .html(d => `<span class="swatch" style="background:${fileTypeColors(d)}"></span>${d}`);

  const brush = d3.brush()
    .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
    .on("brush end", brushed);

  svg.append("g")
    .attr("class", "brush")
    .call(brush);

  function brushed(event) {
    const selection = event.selection;
    if (!selection) return;
    const [[x0, y0], [x1, y1]] = selection;

    svg.selectAll("circle")
      .attr("stroke", d => {
        const cx = x(d.datetime), cy = y(d.lines);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 ? "black" : null;
      })
      .attr("stroke-width", d => {
        const cx = x(d.datetime), cy = y(d.lines);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 ? 2 : null;
      });
  }

  function updateTimeDisplay() {
    commitProgress = +timeSlider.value;
    const commitMaxTime = updateCommitMaxTime();
    selectedTime.text(commitMaxTime.toLocaleDateString());

    filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
    updateScatterPlot(filteredCommits);
    renderFiles();
  }

  // INITIAL DRAW:
  timeSlider.addEventListener("input", updateTimeDisplay);
  updateTimeDisplay();
} // end of loadData()

let data;
let observer;

loadData().then((raw) => {
  data = raw; // raw rows from CSV

  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        // Determine index of this step among its siblings:
        const i = Array.from(entry.target.parentNode.children).indexOf(entry.target);
        highlightStep(i);
      }
    }
  }, { threshold: 0.5 });

  d3.selectAll(".story-step").each(function() {
    observer.observe(this);
  });
});
