// Project slider for the home page (three.js + GSAP).
// Split out of script.js so the other pages don't need these libraries:
// script.js is loaded as a plain <script> on the project pages, where
// import statements aren't allowed.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import * as THREE from "three";
import { vertexShader, fragmentShader } from "./shaders.js";
import { slides } from "./slides.js";

gsap.registerPlugin(SplitText, ScrollTrigger);

// Keep the pinned slider in step with Lenis smooth scrolling (smooth-scroll.js)
window.lenis?.on("scroll", ScrollTrigger.update);

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
// ---------- Project slider: desktop only ----------
// Must match the CSS breakpoint that hides .slider (max-width: 1024px).
const desktopQuery = window.matchMedia("(min-width: 1025px)");

let sliderCleanup = null; // set while the slider is running
let sliderToken = 0; // lets stopSlider() cancel a start that's still loading images

async function startSlider() {
    if (!slider || sliderCleanup) return;
    const token = ++sliderToken;

    // ---- 1. Load textures (the only async step) ----
    const textureLoader = new THREE.TextureLoader();
    const textures = [];
    const textureSizes = [];
    const FALLBACK_SIZE = { width: 1920, height: 1280 };

    for (const slide of slides) {
        const texture = await new Promise((resolve) => {
            textureLoader.load(slide.image, resolve, undefined, (err) => {
                console.error(
                    `Could not load project image "${slide.title}" (${slide.image}):`,
                    err
                );
                resolve(null);
            });
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

    // The screen may have shrunk while images were loading
    if (token !== sliderToken) {
        textures.forEach((t) => t && t.dispose());
        return;
    }

    // ---- 2. Everything below is synchronous, so setup is never half-done ----
    let destroyed = false;
    currentIndex = 0;
    isTransitioning = false;
    rippleTween = null;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    slider.prepend(renderer.domElement);

    const hitbox = document.querySelector(".slide-hitbox");
    function updateHitboxLink(index) {
        if (hitbox && slides[index] && slides[index].link) {
            hitbox.href = slides[index].link;
        }
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
        if (!width || !height) return; // slider is hidden
        renderer.setSize(width, height);
        uniforms.uResolution.value.set(width, height);
        uniforms.uMobile.value = window.innerWidth <= 1000 ? 1.0 : 0.0;
        rippleConfig.endValue = getMaxCornerDist() + rippleConfig.waveWidth;
        rippleConfig.duration = window.innerWidth <= 1000 ? 1.5 : 3.0;
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    // First slide's text
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
            },
        });

        exitTimeline.then(() => {
            if (destroyed) return;
            currentSlide.remove();
            const nextSlide = buildSlideContent(slides[nextIndex]);
            slider.appendChild(nextSlide);

            requestAnimationFrame(() => {
                if (destroyed) return;
                animateTextIn(nextSlide);
            });
        });
    }

    const scrollTrigger = ScrollTrigger.create({
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

    // The layout just changed (grid hidden, slider shown), so re-measure
    ScrollTrigger.refresh();

    let frameId;
    function render() {
        renderer.render(scene, camera);
        frameId = requestAnimationFrame(render);
    }
    render();

    // ---- 3. Teardown, used when the screen drops below the breakpoint ----
    sliderCleanup = () => {
        destroyed = true;
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleResize);

        scrollTrigger.kill(true); // true = also remove the pin spacer
        if (rippleTween) rippleTween.kill();
        gsap.killTweensOf(uniforms.uProgress);

        slider.querySelectorAll(".slide-content").forEach((el) => el.remove());
        renderer.domElement.remove();
        renderer.dispose();
        material.dispose();
        plane.geometry.dispose();
        textures.forEach((t) => t && t.dispose());

        currentIndex = 0;
        isTransitioning = false;
        rippleTween = null;
        sliderCleanup = null;
    };
}

function stopSlider() {
    sliderToken++; // cancels a start() that is still loading images
    if (sliderCleanup) sliderCleanup();
}

function syncSlider() {
    if (desktopQuery.matches) startSlider();
    else stopSlider();
}

syncSlider();
desktopQuery.addEventListener("change", syncSlider);