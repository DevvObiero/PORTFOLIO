// Select the nav items and the indicator span
const navItems = document.querySelectorAll("nav ul li");
const indicator = document.querySelector("nav span");

// Function to set the indicator position
function setIndicatorPosition(item) {
  const itemLeft =
    item.offsetLeft + item.offsetWidth / 2 - indicator.offsetWidth / 2;
  indicator.style.left = `${itemLeft}px`;
}

// Add click event listeners to each nav item
navItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    // Save the index of the clicked item to localStorage
    localStorage.setItem("activeNavIndex", index);

    // Move the indicator and update the active class
    setIndicatorPosition(item);
    navItems.forEach((li) => li.classList.remove("active"));
    item.classList.add("active");
  });
});

// Initialize the indicator position on page load.
// Instead of trusting a localStorage index written at click-time on a
// PREVIOUS page (which can go stale, and is measured before custom
// fonts finish loading), figure out the active tab straight from the
// current URL every time. Self-correcting regardless of how the page
// was reached (click, back/forward, typed URL, bookmark, etc).
function initializeNav() {
  const currentFile =
    window.location.pathname.split("/").filter(Boolean).pop() || "index.html";

  let initialIndex = 0;
  navItems.forEach((item, index) => {
    const link = item.querySelector("a");
    if (!link) return;
    const linkFile = link.getAttribute("href").split("/").filter(Boolean).pop();
    if (linkFile === currentFile) {
      initialIndex = index;
    }
  });

  const initialItem = navItems[initialIndex];

  setIndicatorPosition(initialItem);
  navItems.forEach((li) => li.classList.remove("active"));
  initialItem.classList.add("active");
  localStorage.setItem("activeNavIndex", initialIndex);
}

// Run the initialization function on page load
initializeNav();

// Custom fonts (Pangram) can still be swapping in when initializeNav()
// first runs, which shifts tab widths after the indicator's position was
// already calculated. Recheck once fonts are fully ready.
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    const activeIndex = parseInt(localStorage.getItem("activeNavIndex") || "0", 10);
    setIndicatorPosition(navItems[activeIndex]);
  });
}

// nav scroll
document.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (window.scrollY > 400) {
    nav.classList.add("scrolled"); // Add class when scrolled more than 100px
  } else {
    nav.classList.remove("scrolled"); // Remove class when back to the top
  }
});

// svg rotation on scroll
window.addEventListener("scroll", function () {
  const svg = document.querySelector(".coolness svg");
  if (!svg) return; // page without the footer star
  // Get the scroll position as a percentage of the page height
  const scrollY = window.scrollY;
  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  // Calculate the rotation degree based on scroll
  const rotationDegree = (scrollY / scrollHeight) * 720; // Max rotation is 360 degrees
  svg.style.transform = `rotate(${rotationDegree}deg)`; // Apply the rotation
});

// svg
// Get the SVG path element
const path = document.querySelector(".cls-1");

// Function to check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.top <= window.innerHeight && rect.bottom >= 0;
}

// Event listener for scrolling
window.addEventListener("scroll", () => {
  if (path && isInViewport(path)) {
    // Trigger animation when the SVG is in the viewport
    path.style.strokeDashoffset = "0";
  }
});

// profile page
const texts = [
  "    PAUL OBIERO",
  "A WEB DEVELOPER",
  "A STUDENT",
  "A TECH ENTHUSIAST"
];

// Renamed from `currentIndex` -> `profileTextIndex`.
// The slider code (now in slider.js) also used `currentIndex`, and two
// `let currentIndex` declarations in one file is a SyntaxError that
// silently killed the whole script.
let profileTextIndex = 0;

function changeText() {
  const dynamicText = document.getElementById("dynamicText");
  if (!dynamicText) return; // this element only exists on profile.html

  profileTextIndex = (profileTextIndex + 1) % texts.length; // Cycle through array
  dynamicText.textContent = texts[profileTextIndex];
}

setInterval(changeText, 2000);

// dark mode
const toggleButton = document.getElementById("toggle-theme");
const body = document.body;
const sunIcon = document.getElementById("sun-icon");
const moonIcon = document.getElementById("moon-icon");

// Check if the user prefers dark mode from localStorage
if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark-mode");
  moonIcon.style.display = "block";
  sunIcon.style.display = "none";
}

// Toggle the theme and icons
toggleButton.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  if (body.classList.contains("dark-mode")) {
    moonIcon.style.display = "block";
    sunIcon.style.display = "none";
    localStorage.setItem("theme", "dark");
  } else {
    moonIcon.style.display = "none";
    sunIcon.style.display = "block";
    localStorage.setItem("theme", "light");
  }
});

// movement of the cursor

window.addEventListener("mousemove", (e) => {
  let cursor = document.getElementById("cursor");
  if (!cursor) return; // Ensure the element exists

  setTimeout(() => {
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
  }, 60);
});

// cursor transition
const cursor = document.querySelector(".cursor");
const hoverElements = document.querySelectorAll(
  ".grid-item a, nav ul li a ,.icons i,.hero-img .img ,footer li a, .grid-item img,.custom-video "
); // Added video elements

hoverElements.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    cursor.style.transform = "scale(7.5)"; // Increase size
  });

  element.addEventListener("mouseleave", () => {
    cursor.style.transform = "scale(1)"; // Reset size
  });
});

// cursor transition
// lingo

const icons = document.querySelectorAll(".reveal-icon");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add("show");
        }, index * 150); // delay each icon
        observer.unobserve(entry.target); // remove if you only want it to trigger once
      }
    });
  },
  {
    threshold: 0.2
  }
);

icons.forEach((icon) => observer.observe(icon));
