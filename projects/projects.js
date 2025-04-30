import { fetchJSON, $$, renderProjects } from "/portfolio/global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function loadAndRenderProjects() {
    try {
        const projects = await fetchJSON("/portfolio/lib/projects.json");
  
        const container = document.querySelector(".projects");
        if (projects && container) {
            renderProjects(projects, container);
  
            const title = document.querySelector(".page-title");
            title.textContent = `${projects.length} Projects`;
  
            // ✅ D3 PIE CHART CODE STARTS HERE
            const yearCounts = {};
            projects.forEach(p => {
              yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
            });
  
            const data = Object.entries(yearCounts).map(([label, value]) => ({ label, value }));
            const pie = d3.pie().value(d => d.value);
            const arc = d3.arc().innerRadius(0).outerRadius(50);
            const arcs = pie(data);
  
            const svg = d3.select("#projects-plot");  // Correct ID is #projects-plot
            const color = d3.scaleOrdinal(d3.schemeTableau10);
  
            arcs.forEach((d, i) => {
              svg.append("path")
                .attr("d", arc(d))
                .attr("fill", color(i));
            });
            // ✅ D3 PIE CHART CODE ENDS HERE
        }
  
    } catch (error) {
        console.error("Error loading projects: ", error);
    }
  }

loadAndRenderProjects();