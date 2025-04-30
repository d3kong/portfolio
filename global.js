console.log("IT'S ALIVE");

export async function fetchJSON(url) {
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}

export function $$(selector, context=document) {
    return Array.from(context.querySelectorAll(selector));
}

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

const currentPath = location.pathname;

$$("nav a").forEach((a) => {
    if (a.getAttribute("href").endsWith(currentPath)) {
        a.setAttribute("aria-current", "page");
    }
})

const themeButton = document.getElementById("toggle-theme");

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
}

themeButton?.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
})
