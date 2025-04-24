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

export function $$(selector, context=document) {
    return Array.from(context.querySelectorAll(selector));
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
