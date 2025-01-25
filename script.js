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
