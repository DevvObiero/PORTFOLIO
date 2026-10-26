// Behaviour for every page inside /blog/.
// The blog home page builds its cards and tag filter from posts.js; post
// pages get previous/next links and copy buttons on code blocks. The nav,
// theme toggle and cursor mirror script.js, which the blog doesn't load
// because it imports three.js and GSAP for the home page slider.
import { posts } from "./posts.js";

const newestFirst = [...posts].sort((a, b) => b.date.localeCompare(a.date));

// The hand-drawn line from the home page hero, reused as card artwork
const HERO_LINE =
  "M2.13,496.09C25.31,517.29,50.31,536.29,79.31,548.29c26,10,54,11,80-1,9-5,17-11,24-19,7-9,12-19,16-29,5-13,5-26,5-39,0-6,1-11,0-17-2-8-2-15-4-22-3-7-4-14-7-21-7-17-16-31-27-47-9-11-17-21-26-32-18-24-36-45-53-70-2-3-3-7-4-10-1-2-4-3-5-5-21-40-33-88-13-131,2-4,5-9,7-13C104.31,44.29,160.31,25.29,214.31,28.29c21,2,40,5,60,12,29,11,55,25,81,44,19,15,36,28,53,44,3,2,6,4,8,6,5,6,11,11,17,17,7,6,14,12,21,19,18,16,35,29,54,44,11,7,21,13,32,20,18,10,36,18,55,24,18,7,37,10,56,12,21,2,41-2,61-8,66-24,98-86,133-144,7-10,13-19,20-29,6-8,12-16,19-24,9-10,18-18,28-26,16-12,32-22,50-29,25-10,53-9,78,0,46,18,64,66,71,112,7,52,6,104,24,153,9,22,22,44,44,56l3,3c5,2,9,6,15,7,2,1,4,3,7,4,19,7,38,12,58,18,3,1,7,3,10,5h4c18,10,34,19,46,36,11,16,17,33,18,52,2,44-15,85-37,123-18,30-35,57-46,89-6,18-9,37-9,56,1,7,1,15,2,22,3,17,7,32,13,47,14,33,34,60,63,83,56,43,132,52,193,16l3-3c2-1,5-2,7-4,6-5,11-11,19-14,13-15,28-28,39-46,2-3,2-5,4-8,20-28,30-57,39-89,9-36,14-72,11-108-5-70-32-133-52-201-8-31-14-61-12-92,3-36,14-69,35-101,5-7,11-13,16-20,6-7,12-14,20-18l6-6c9-7,18-13,28-19,4-2,9-4,14-6,25-9,51-15,77.58-14.32";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(isoDate) {
  // Build the date from its parts: new Date("2026-10-23") means midnight UTC,
  // which shows as the 22nd for anyone west of London.
  const [year, month, day] = isoDate.split("-").map(Number);
  return dateFormat.format(new Date(year, month - 1, day));
}

function escapeHTML(value) {
  const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value).replace(/[&<>"']/g, (char) => entities[char]);
}

// ---------- Blog home: cards + tag filter ----------

function postCard(post, index) {
  const media = post.cover
    ? `<img src="${escapeHTML(post.cover)}" alt="" loading="lazy" decoding="async" />`
    : `<div class="post-card__art${index % 2 ? " post-card__art--flip" : ""}" aria-hidden="true">
         <svg viewBox="0 0 1773.98 917.81" preserveAspectRatio="xMidYMid slice"><path d="${HERO_LINE}" /></svg>
         <span>${escapeHTML(post.tags[0] ?? "")}</span>
       </div>`;

  return `
    <a class="project-card post-card" href="posts/${encodeURIComponent(post.slug)}.html">
      <div class="project-card__media">${media}</div>
      <div class="project-card__body">
        <h3>${escapeHTML(post.title)}</h3>
        <div class="post-card__meta">
          <time datetime="${post.date}">${formatDate(post.date)}</time>
          <span>${post.readingTime} min read</span>
        </div>
        <p>${escapeHTML(post.description)}</p>
        <ul class="post-tags" aria-label="Tags">
          ${post.tags.map((tag) => `<li>${escapeHTML(tag)}</li>`).join("")}
        </ul>
      </div>
    </a>`;
}

function setUpBlogHome(grid) {
  const filter = document.querySelector("[data-tag-filter]");
  const status = document.querySelector("[data-filter-status]");
  const tags = [...new Set(newestFirst.flatMap((post) => post.tags))].sort();

  filter.innerHTML = ["All", ...tags]
    .map((tag) => `<button type="button" class="chip" data-tag="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`)
    .join("");

  function show(tag, { announce = true } = {}) {
    const visible = tag === "All" ? newestFirst : newestFirst.filter((post) => post.tags.includes(tag));

    grid.innerHTML = visible.length
      ? visible.map(postCard).join("")
      : `<p class="post-grid__empty">No posts tagged ${escapeHTML(tag)} yet.</p>`;

    filter.querySelectorAll(".chip").forEach((chip) => {
      chip.setAttribute("aria-pressed", String(chip.dataset.tag === tag));
    });

    if (announce) {
      const count = `${visible.length} post${visible.length === 1 ? "" : "s"}`;
      status.textContent = tag === "All" ? `Showing all ${count}` : `Showing ${count} tagged ${tag}`;
    }

    // Keep the filter in the address bar so a filtered view can be shared
    const url = new URL(window.location.href);
    if (tag === "All") url.searchParams.delete("tag");
    else url.searchParams.set("tag", tag);
    history.replaceState(null, "", url);
  }

  filter.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (chip) show(chip.dataset.tag);
  });

  const requested = new URLSearchParams(window.location.search).get("tag");
  show(tags.includes(requested) ? requested : "All", { announce: false });
}

// ---------- Post pages: previous / next ----------

function pagerLink(post, label, className) {
  return `
    <a class="${className}" href="${encodeURIComponent(post.slug)}.html">
      <span class="post-pager__label">${label}</span>
      <span class="post-pager__title">${escapeHTML(post.title)}</span>
    </a>`;
}

function setUpPager(pager) {
  // The canonical URL is always the real address, even when testing locally
  const canonical = document.querySelector('link[rel="canonical"]')?.href ?? window.location.href;
  const slug = new URL(canonical).pathname.split("/").pop().replace(/\.html$/, "");
  const index = newestFirst.findIndex((post) => post.slug === slug);

  if (index === -1) {
    console.warn(`blog.js: no post in posts.js has the slug "${slug}". Check the canonical URL and posts.js match.`);
    pager.remove();
    return;
  }

  const older = newestFirst[index + 1];
  const newer = newestFirst[index - 1];

  pager.innerHTML = [
    older && pagerLink(older, "Previous post", "post-pager__prev"),
    newer && pagerLink(newer, "Next post", "post-pager__next"),
  ]
    .filter(Boolean)
    .join("");
}

// ---------- Post pages: code blocks ----------

const LANGUAGE_NAMES = {
  js: "JavaScript",
  javascript: "JavaScript",
  html: "HTML",
  markup: "HTML",
  css: "CSS",
  json: "JSON",
  bash: "Terminal",
  plain: "Outline",
};

function enhanceCodeBlock(pre) {
  const code = pre.querySelector("code");
  if (!code) return;

  const language = code.className.match(/language-(\w+)/)?.[1] ?? "";
  const wrapper = document.createElement("div");
  wrapper.className = "code-block";
  wrapper.innerHTML = `
    <div class="code-block__bar">
      <span>${LANGUAGE_NAMES[language] ?? escapeHTML(language)}</span>
      ${navigator.clipboard ? '<button type="button" class="code-block__copy" aria-live="polite">Copy</button>' : ""}
    </div>`;

  pre.before(wrapper);
  wrapper.append(pre);
  pre.tabIndex = 0; // lets keyboard users scroll long lines

  wrapper.querySelector("button")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Couldn't copy";
    }
    setTimeout(() => (button.textContent = "Copy"), 2000);
  });
}

// ---------- Shared: nav, theme, cursor, footer ----------

function setUpNav() {
  const nav = document.querySelector("nav");
  const indicator = nav?.querySelector("span");
  const blogLink = nav?.querySelector('a[href$="blog/index.html"]');
  if (!indicator || !blogLink) return;

  const item = blogLink.closest("li");
  const place = () => {
    indicator.style.left = `${item.offsetLeft + item.offsetWidth / 2 - indicator.offsetWidth / 2}px`;
  };

  place();
  document.fonts?.ready.then(place); // Pangram can swap in after first paint
  window.addEventListener("resize", place);

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 400);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setUpThemeToggle() {
  const button = document.getElementById("toggle-theme");
  if (!button) return;

  button.setAttribute("aria-pressed", String(document.body.classList.contains("dark-mode")));
  button.addEventListener("click", () => {
    const dark = document.body.classList.toggle("dark-mode");
    button.setAttribute("aria-pressed", String(dark));
    try {
      localStorage.setItem("theme", dark ? "dark" : "light");
    } catch {
      // storage blocked: the theme still changes for this page
    }
  });
}

function setUpCursor() {
  const cursor = document.getElementById("cursor");
  if (!cursor || !window.matchMedia("(pointer: fine)").matches) return;

  const growOn = "nav a, nav button, .project-card, .chip, .post-pager a, .btn, .text2 a, footer a, .back-link";

  window.addEventListener("mousemove", (event) => {
    setTimeout(() => {
      cursor.style.top = `${event.clientY}px`;
      cursor.style.left = `${event.clientX}px`;
    }, 60);
  });

  document.addEventListener("mouseover", (event) => {
    cursor.style.transform = event.target.closest(growOn) ? "scale(7.5)" : "scale(1)";
  });
}

function setUpFooterStar() {
  const star = document.querySelector(".coolness svg");
  if (!star || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  window.addEventListener(
    "scroll",
    () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0) star.style.transform = `rotate(${(window.scrollY / scrollable) * 720}deg)`;
    },
    { passive: true }
  );
}

// ---------- Start ----------

setUpNav();
setUpThemeToggle();
setUpCursor();
setUpFooterStar();

const grid = document.querySelector("[data-post-grid]");
if (grid) setUpBlogHome(grid);

const pager = document.querySelector("[data-post-pager]");
if (pager) setUpPager(pager);

document.querySelectorAll(".post-body pre").forEach(enhanceCodeBlock);
