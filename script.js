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

// Renamed from `currentIndex` -> `profileTextIndex`.
// The slider code further down also declared `let currentIndex = 0;`.
// Having two `let currentIndex` declarations in the same module scope is
// a SyntaxError ("Identifier 'currentIndex' has already been declared"),
// which silently killed the ENTIRE script.js on every page - nothing
// below this point ever ran (nav indicator, dark mode toggle, custom
// cursor, icon reveal-on-scroll, and the whole project slider/WebGL
// setup). Renaming this one fixes that.
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


import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders.js";
import { slides } from "./slides.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

let currentIndex = 0;
let isTransitioning = false;
let rippleTween = null;

const slider = document.querySelector(".slider");

function splitTitle(container) {
    const heading = container.querySelector(".slide-title h1");
    if (!heading) return null;

    return SplitText.create(heading, {
        type: "words, chars",
        mask: "chars",
        wordsClass: "word",
        charsClass: "char",
    });
}

function splitDescription(container) {
    const paragraphs = container.querySelectorAll(".slide-description p");
    const allLines = [];

    paragraphs.forEach((p) => {
        const split = SplitText.create(p, {
            type: "lines",
            mask: "lines",
            linesClass: "line",
        });

        allLines.push(...split.lines);
    });

    return allLines;
}

function buildSlideContent(slide) {
    const el = document.createElement("div");
    el.className = "slide-content";
    el.style.opacity = "0";

    el.innerHTML = `
        <div class="slide-title"><h1>${slide.title}</h1></div>
        <div class="slide-description">
            <p>${slide.description}</p>
        </div>
    `;

    return el;
}

function animateTextOut(container) {
    const titleSplit = splitTitle(container);
    const lines = splitDescription(container);

    const tl = gsap.timeline();

    if (titleSplit) {
        tl.to(titleSplit.chars, {
            y: "-100%",
            duration: 0.6,
            stagger: 0.02,
            ease: "power2.inOut",
        });
    }

    tl.to(
        lines,
        { y: "-100%", duration: 0.6, stagger: 0.02, ease: "power2.inOut" },
        0.1
    );

    return tl;
}

function animateTextIn(container) {
    const titleSplit = splitTitle(container);
    const lines = splitDescription(container);

    const chars = titleSplit ? titleSplit.chars : [];

    gsap.set([chars, lines], { y: "100%" });
    gsap.set(container, { opacity: 1 });

    return gsap
        .timeline()
        .to(chars, {
            y: "0%",
            duration: 0.5,
            stagger: 0.02,
            ease: "power2.inOut",
        })
        .to(
            lines,
            { y: "0%", duration: 0.5, stagger: 0.05, ease: "power2.out" },
            0.1
        );
}

if (slider) {
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    slider.prepend(renderer.domElement);

    // Keeps the invisible clickable box over the photo pointed at
    // whichever project is currently showing.
    const hitbox = document.querySelector(".slide-hitbox");
    function updateHitboxLink(index) {
        if (hitbox && slides[index] && slides[index].link) {
            hitbox.href = slides[index].link;
        }
    }

    const textureLoader = new THREE.TextureLoader();
    const textures = [];
    // Each image's own real width/height, in the same order as `textures`.
    // Fixes the shader assuming every photo was 1920x1280 (which caused
    // stretching for any image that wasn't actually that exact size).
    const textureSizes = [];
    const FALLBACK_SIZE = { width: 1920, height: 1280 };

    for (const slide of slides) {
        const texture = await new Promise((resolve) => {
            textureLoader.load(
                slide.image,
                resolve,
                undefined,
                (err) => {
                    console.error(
                        `Could not load project image "${slide.title}" (${slide.image}):`,
                        err
                    );
                    resolve(null); // don't let one bad image hang the whole slider
                }
            );
        });

        if (texture) {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            textureSizes.push({
                width: texture.image.width,
                height: texture.image.height,
            });
        } else {
            textureSizes.push(FALLBACK_SIZE);
        }
        textures.push(texture);
    }

    const rippleConfig = {
        waveFreq: 25.0,
        wavePow: 0.035,
        waveWidth: 0.5,
        falloff: 10.0,
        boostStrength: 0.5,
        crossfadeWidth: 0.05,
        duration: 3.0,
        endValue: 1.0,
        ease: "power2.out",
    };

    const uniforms = {
        uTexCurrent: { value: textures[0] },
        uTexNext: { value: textures[1] },
        uProgress: { value: 0.0 },
        uResolution: { value: new THREE.Vector2() },
        uImageResCurrent: {
            value: new THREE.Vector2(textureSizes[0].width, textureSizes[0].height),
        },
        uImageResNext: {
            value: new THREE.Vector2(textureSizes[1].width, textureSizes[1].height),
        },
        uWaveFreq: { value: rippleConfig.waveFreq },
        uWavePow: { value: rippleConfig.wavePow },
        uWaveWidth: { value: rippleConfig.waveWidth },
        uFalloff: { value: rippleConfig.falloff },
        uBoostStrength: { value: rippleConfig.boostStrength },
        uCrossfadeWidth: { value: rippleConfig.crossfadeWidth },
        uMobile: { value: window.innerWidth <= 1000 ? 1.0 : 0.0 },
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    scene.add(plane);

    function getMaxCornerDist() {
        const ratio = window.innerHeight / window.innerWidth;
        const cx = 0.5;
        const cy = 0.5 * ratio;
        return Math.sqrt(cx * cx + cy * cy);
    }

    function handleResize() {
        const width = slider.clientWidth;
        const height = slider.clientHeight;
        renderer.setSize(width, height);
        uniforms.uResolution.value.set(width, height);
        uniforms.uMobile.value = window.innerWidth <= 1000 ? 1.0 : 0.0;
        rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
        rippleConfig.duration = window.innerWidth <= 1000 ? 1.5 : 3.0;
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    // Build the first slide from slides.js (instead of relying on the
    // hardcoded "Project 1" placeholder that used to live in index.html) so
    // the title/description on screen always match the image actually being
    // rendered by the shader.
    const initialSlide = buildSlideContent(slides[0]);
    initialSlide.style.opacity = "1";
    slider.appendChild(initialSlide);
    updateHitboxLink(0);

    const initialTitle = splitTitle(initialSlide);
    const initialLines = splitDescription(initialSlide);

    gsap.fromTo(
        initialTitle.chars,
        { y: "100%" },
        { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out" }
    );

    gsap.fromTo(
        initialLines,
        { y: "100%" },
        { y: "0%", duration: 0.8, stagger: 0.025, ease: "power2.out", delay: 0.2 }
    );

    // Advances the slider to `nextIndex`, playing the same ripple / text
    // crossfade that used to run on click. Called from the ScrollTrigger
    // below instead of a click handler.
    function goToSlide(nextIndex) {
        if (isTransitioning || nextIndex === currentIndex) return;
        isTransitioning = true;
        updateHitboxLink(nextIndex);

        if (rippleTween) {
            rippleTween.kill();
            uniforms.uProgress.value = 0.0;
            rippleTween = null;
        }

        const currentSlide = document.querySelector(".slide-content");

        const exitTimeline = animateTextOut(currentSlide);

        uniforms.uTexCurrent.value = textures[currentIndex];
        uniforms.uTexNext.value = textures[nextIndex];
        uniforms.uImageResCurrent.value.set(
            textureSizes[currentIndex].width,
            textureSizes[currentIndex].height
        );
        uniforms.uImageResNext.value.set(
            textureSizes[nextIndex].width,
            textureSizes[nextIndex].height
        );
        uniforms.uProgress.value = 0.0;
        let rippleUnlocked = false;

        rippleTween = gsap.to(uniforms.uProgress, {
            value: rippleConfig.endValue,
            duration: rippleConfig.duration,
            ease: rippleConfig.ease,
            delay: 0.3,
            onUpdate() {
                if (!rippleUnlocked && uniforms.uProgress.value > 0.7) {
                    rippleUnlocked = true;
                    currentIndex = nextIndex;
                    isTransitioning = false;
                }
            },
            onComplete() {
                uniforms.uTexCurrent.value = textures[currentIndex];
                uniforms.uImageResCurrent.value.set(
                    textureSizes[currentIndex].width,
                    textureSizes[currentIndex].height
                );
                uniforms.uProgress.value = 0.0;
                rippleTween = null;

                if (!rippleUnlocked) {
                    currentIndex = nextIndex;
                    isTransitioning = false;
                }
            }
        });

        exitTimeline.then(() => {
            currentSlide.remove();
            const nextSlide = buildSlideContent(slides[nextIndex]);
            slider.appendChild(nextSlide);

            requestAnimationFrame(() => {
                animateTextIn(nextSlide);
            });
        });
    }

    // Pin the slider in place and step through each project as the user
    // scrolls (instead of requiring a click). The section stays pinned for
    // one viewport-height of scroll per remaining slide, then releases and
    // scrolling continues normally down to the footer.
    ScrollTrigger.create({
        trigger: slider,
        start: "top top",
        end: () => `+=${window.innerHeight * (slides.length - 1)}`,
        pin: true,
        anticipatePin: 1,
        onUpdate(self) {
            const targetIndex = Math.min(
                slides.length - 1,
                Math.round(self.progress * (slides.length - 1))
            );
            if (targetIndex !== currentIndex && !isTransitioning) {
                goToSlide(targetIndex);
            }
        },
    });

    function render() {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    render();
}