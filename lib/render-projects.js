import { $$ } from "/portfolio/global.js";
import { fetchJSON } from "/portfolio/global.js";

const container = $$(".projects")[0];

fetchJSON("/portfolio/lib/projects.json").then((projects) => {
  for (const project of projects) {
    const article = document.createElement("article");
    article.innerHTML = `
      <h2>${project.title}</h2>
      <img src="${project.image}" alt="Screenshot of ${project.title}">
      <p>${project.description}</p>
    `;
    container.appendChild(article);
  }
});
  
