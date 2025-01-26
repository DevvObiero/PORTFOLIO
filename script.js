// Select the nav items and the indicator span
const navItems = document.querySelectorAll("nav ul li");
const indicator = document.querySelector("nav span");

// Add click event listeners to each nav item
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    // Get the left position of the clicked item
    const itemLeft =
      item.offsetLeft + item.offsetWidth / 2 - indicator.offsetWidth / 2;

    // Move the indicator to the clicked item
    indicator.style.left = `${itemLeft}px`;

    // Remove 'active' class from all items and set it on the clicked one
    navItems.forEach((li) => li.classList.remove("active"));
    item.classList.add("active");
  });
});

// Initialize the indicator position on page load
if (navItems.length > 0) {
  const initialItem = navItems[0];
  const initialLeft =
    initialItem.offsetLeft +
    initialItem.offsetWidth / 2 -
    indicator.offsetWidth / 2;
  indicator.style.left = `${initialLeft}px`;
  initialItem.classList.add("active");
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
