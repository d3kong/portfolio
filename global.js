console.log("IT'S ALIVE");

function $$(selector, context=document) {
    return Array.from(context.querySelectorAll(selector));
}

const currentPath = location.pathname.split("/").pop() || "index.html";

$$("nav a").forEach((a) => {
    if (a.getAttrirbute("href").endsWith(currentPath)) {
        a.setAttribute("aria-current", "page");
    }
})
