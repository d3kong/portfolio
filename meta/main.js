console.log("Script loaded!");

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function loadData() {
    const data = await d3.csv("loc.csv", (row) => ({
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

    const x = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(commits, d => d.lines)])
        .range([height - margin.bottom, margin.top]);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.append("g")
        .selectAll("circle")
        .data(commits)
        .join("circle")
        .attr("cx", d => x(d.datetime))
        .attr("cy", d => y(d.lines))
        .attr("r", 4)
        .attr("fill", "steelblue");

    return data;
}

let data = await loadData();