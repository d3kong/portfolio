console.log("Script loaded!");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let commitProgress = 100;
let filteredCommits = [];
let timeSlider = d3.select("#timeSlider").node();
const selectedTime = d3.select("#selectedTime");

async function loadData() {
  const prefix = location.hostname === "localhost" ? "" : "/portfolio";
  const data = await d3.csv(`${prefix}/meta/loc.csv`, (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));

  console.log("Loaded data:", data);

  const totalLines = data.length;
  const uniqueCommits = new Set(data.map(d => d.commit)).size;
  const lengths = data.map(d => d.length);
  const minLength = d3.min(lengths);
  const maxLength = d3.max(lengths);

  const statsDiv = d3.select("#stats");
  statsDiv.append("p").text(`Total lines: ${totalLines}`);
  statsDiv.append("p").text(`Unique commits: ${uniqueCommits}`);
  statsDiv.append("p").text(`Line length range: ${minLength} to ${maxLength}`);

  const commits = d3.rollups(
    data,
    v => ({
      datetime: v[0].datetime,
      lines: v.length
    }),
    d => d.commit
  ).map(([commit, info]) => ({ commit, ...info }));

  console.log("Grouped commits:", commits);

  const width = 800;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const tooltip = d3.select("#tooltip");

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
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxisGrid);

  svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  const timeScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, 100]);

  function updateCommitMaxTime() {
    return timeScale.invert(commitProgress);
  }

  function updateScatterPlot(data) {
    svg.selectAll("circle").remove();

    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => x(d.datetime))
      .attr("cy", d => y(d.lines))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`Commit: ${d.commit}<br>Lines: ${d.lines}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", (event.pageY + 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });
  }

  function updateTimeDisplay() {
    commitProgress = +timeSlider.value;
    const commitMaxTime = updateCommitMaxTime();
    selectedTime.text(commitMaxTime.toLocaleString());

    filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);
    updateScatterPlot(filteredCommits);

    renderFiles();
  }

  function renderFiles() {
    const lines = data.filter(d => d.datetime <= updateCommitMaxTime());
    
    let files = d3.groups(lines, d => d.file)
        .map(([name, lines]) => ({ name, lines }));

    files = d3.sort(files, d => -d.lines.length);

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
        const cx = x(d.datetime);
        const cy = y(d.lines);
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 ? "black" : null;
      })
      .attr("stroke-width", d => {
        const cx = x(d.datetime);
        const cy = y(d.lines);
        return x0 <= cx && cx <= x1 && y0 <= cy && y0 <= cy && cy <= y1 ? 2 : null;
      });
  }

  // Init
  timeSlider.addEventListener("input", updateTimeDisplay);
  updateTimeDisplay();

  function highlightStep(i) {
    if (i === 1) {
        const biggest = d3.max(commits, d => d.lines);
        svg.selectAll("circle")
            .attr("fill", d => d.lines === biggest ? "crimson" : "lightgray")
            .attr("r", d => d.lines === biggest ? 6 : 2);
    } else if (i === 2) {
        const topFile = d3.rollups(data, v => v.length, d => d.file)
            .sort((a, b) => d3.descending(a[1], b[1]))[0][0];

        svg.selectAll("circle")
            .attr("fill", d => d.file === topFile ? "gold" : "lightgray")
            .attr("r", d => d.file === topFile ? 6 : 2);
    } else {
        svg.selectAll("circle")
            .attr("fill", "steelblue")
            .attr("r", 4);
    }
  }

  return data;
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const i = [...entry.target.parentNode.children].indexOf(entry.target);
      highlightStep(i);
    }
  }
}, {
  threshold: 0.5
});

d3.selectAll("main.scrolly section").each(function () {
  observer.observe(this);
});

let data = await loadData();
