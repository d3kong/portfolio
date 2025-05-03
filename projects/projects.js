import { fetchJSON, $$, renderProjects } from "/portfolio/global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let allProjects = [];
let container;

async function loadAndRenderProjects() {
  try {
    allProjects = await fetchJSON("/portfolio/lib/projects.json");
    container = document.querySelector(".projects");

    if (allProjects && container) {
      // Render the full list initially
      renderProjects(allProjects, container);

      // Render the pie chart and legend using all projects
      updatePieAndLegend(allProjects);

      // Update the page title with total count
      const title = document.querySelector(".page-title");
      title.textContent = `${allProjects.length} Projects`;
    }

  } catch (error) {
    console.error("Error loading projects: ", error);
  }
}

loadAndRenderProjects();

function updatePieAndLegend(projectSubset) {
  const svg = d3.select("#projects-plot");
  const legend = d3.select(".legend");

  svg.selectAll("*").remove();
  legend.selectAll("*").remove();

  const rolledData = d3.rollups(
    projectSubset,
    v => v.length,
    d => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    label: year,
    value: count
  }));

  const pie = d3.pie().value(d => d.value);
  const arc = d3.arc().innerRadius(0).outerRadius(50);
  const arcs = pie(data);
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  arcs.forEach((d, i) => {
    svg.append("path")
      .attr("d", arc(d))
      .attr("fill", color(i));
  });

  data.forEach((d, idx) => {
    legend.append("li")
      .attr("style", `--color: ${color(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

const searchInput = document.querySelector(".search");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  const filtered = allProjects.filter(p =>
    [p.title, p.description, p.year].some(field =>
      field.toLowerCase().includes(query)
    )
  );

  renderProjects(filtered, container);
  updatePieAndLegend(filtered);
});