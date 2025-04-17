console.log("IT'S ALIVE");

function $$(selector, context=document) {
    return Array.from(context.querySelectorAll(selector));
}

const currentPath = location.pathname;

$$("nav a").forEach((a) => {
    if (a.getAttribute("href").endsWith(currentPath)) {
        a.setAttribute("aria-current", "page");
    }
})
