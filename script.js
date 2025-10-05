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

// Initialize the indicator position on page load
function initializeNav() {
  const savedIndex = localStorage.getItem("activeNavIndex");
  let initialIndex = savedIndex !== null ? parseInt(savedIndex) : 0; // Default to Home

  // Ensure the Home tab (index 0) is selected on first visit
  if (
    window.location.pathname === "/" ||
    window.location.pathname.includes("index.html")
  ) {
    initialIndex = 0; // Set Home as default
  }

  const initialItem = navItems[initialIndex];

  // Set the indicator and active class based on saved state
  setIndicatorPosition(initialItem);
  navItems.forEach((li) => li.classList.remove("active"));
  initialItem.classList.add("active");
}

// Run the initialization function on page load
initializeNav();

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
  if (isInViewport(path)) {
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

let currentIndex = 0;

function changeText() {
  const dynamicText = document.getElementById("dynamicText");

  currentIndex = (currentIndex + 1) % texts.length; // Cycle through array
  dynamicText.textContent = texts[currentIndex];
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

// download

// document.getElementById("downloadBtn").addEventListener("click", function () {
//   const link = document.createElement("a");
//   link.href = "./Paul Obiero - Full Stack Web Developer - Resume.pdf";
//   link.download = "My_CV.pdf";
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// });

// movement of the cursor

window.addEventListener("mousemove", (e) => {
  let cursor = document.getElementById("cursor");
  cursor.style.top = "${e.clientY}px";
  cursor.style.left = "${e.clientX}px";
});

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
