import { fetchJSON, renderProjects } from "./global.js";

async function loadLatestProjects() {
    try {
        const allProjects = await fetchJSON("./lib/projects.json");
        const latestProjects = allProjects.slice(0, 3);
        const container = document.querySelector(".projects");

        if (latestProjects && container) {
            renderProjects(latestProjects, container, "h2");
        }
    } catch (error) {
        console.error("Error loading latest projects: ", error);
    }
}

loadLatestProjects();