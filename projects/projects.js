import { fetchJSON, $$, renderProjects } from "/portfolio/global.js";

async function loadAndRenderProjects() {
    try {
        const projects = await fetchJSON("/portfolio/lib/projects.json");
  
        const container = document.querySelector(".projects");
        if (projects && container) {
            console.log("Fetched projects:", projects);
            renderProjects(projects, container);
    
            const title = document.querySelector(".page-title");
    
            if (title && Array.isArray(projects)) {
                title.textContent = `${projects.length} Projects`;
            } else if (title) {
                title.textContent = `Projects`;
            }
        }
    } catch (error) {
        console.error("Error loading projects: ", error);
    }
}  

loadAndRenderProjects();