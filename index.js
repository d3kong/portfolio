import { fetchJSON, renderProjects, fetchGitHubData } from "./global.js";

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

async function loadGitHubStats() {
    try {
      const githubData = await fetchGitHubData("d3kong"); // your GitHub username
      const profileStats = document.querySelector("#profile-stats");
  
      if (profileStats) {
            profileStats.innerHTML = `
                <dl class="github-cards">
                    <div class="card">
                        <dt>Followers</dt>
                        <dd>${githubData.followers}</dd>
                    </div>
                    <div class="card">
                        <dt>Following</dt>
                        <dd>${githubData.following}</dd>
                    </div>
                    <div class="card">
                        <dt>Public Repos</dt>
                        <dd>${githubData.public_repos}</dd>
                    </div>
                    <div class="card">
                        <dt>Public Gists</dt>
                        <dd>${githubData.public_gists}</dd>
                    </div>
                </dl>

            `;
      }
    } catch (error) {
        console.error("Error loading GitHub data:", error);
    }
}
  
loadGitHubStats();
  

loadLatestProjects();