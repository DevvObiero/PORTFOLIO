import { slides } from "./slides.js";

const grid = document.getElementById("project-grid");

grid.innerHTML = slides
  .map(
    ({ title, description, image, link }) => `
    <a class="project-card" href="${link}">
      <div class="project-card__media">
        <img src="${image}" alt="${title} preview" loading="lazy" />
      </div>
      <div class="project-card__body">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    </a>`
  )
  .join("");