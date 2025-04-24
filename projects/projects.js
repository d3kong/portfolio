import { fetchJSON, $$ } from "/portfolio/global.js";

function renderProjects(projects, container, headingLevel = 'h2') {
    container.innerHTML = "";
    projects.forEach(project => {
        const article = document.createElement("article");
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${project.image}" alt="Screenshot of ${project.title}">
            <p>${project.description}</p>
        `;
        container.appendChild(article);
    });
}

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