/* ============================================================
   Stackly Transportation & Logistics – Slider Module
   ============================================================
   Handles:
   1. Hero Slider        – fade transitions, auto-slide, controls, dots,
                           keyboard nav, touch/swipe, pause-on-hover
   2. Testimonial Slider – auto-slide carousel with pause-on-hover
   3. Partners/Brand     – infinite auto-scrolling logo track
   4. Fleet Carousel     – horizontal scroll with nav buttons
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     Utility Helpers
     ---------------------------------------------------------- */

  /** Select a single element */
  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  /** Select all elements as a real Array */
  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  /** Clamp a number between min and max */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /* ============================================================
     1. HERO SLIDER
     ============================================================ */
  class HeroSlider {
    /**
     * @param {HTMLElement} el – the .hero-slider wrapper
     * @param {Object}      opts – configuration overrides
     */
    constructor(el, opts = {}) {
      if (!el) return;

      // DOM references
      this.el = el;
      this.slides = $$(".slide", el);
      this.prevBtn = $(".slider-prev", el);
      this.nextBtn = $(".slider-next", el);
      this.dotsContainer = $(".slider-dots", el);
      this.counterCurrent = $(".slide-counter-current", el);

      if (!this.slides.length) return;

      // Config
      this.interval = opts.interval || 5000;
      this.currentIndex = 0;
      this.total = this.slides.length;
      this._timer = null;
      this._paused = false;
      this._touchStartX = 0;
      this._touchEndX = 0;

      this._createDots();
      this._init();
    }

    /* ---- Initialisation ---- */

    _createDots() {
      if (!this.dotsContainer) return;
      this.dotsContainer.innerHTML = "";
      this.dots = [];
      for (let i = 0; i < this.total; i++) {
        const dot = document.createElement("span");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        dot.addEventListener("click", () => this.goTo(i));
        this.dotsContainer.appendChild(dot);
        this.dots.push(dot);
      }
    }

    _init() {
      // Ensure only the first slide is active on load
      this.slides.forEach((s, i) => {
        s.classList.toggle("active", i === 0);
      });
      this._updateDots();
      this._updateCounter();
      this._bindEvents();
      this._startAuto();
    }

    /* ---- Navigation ---- */

    /** Go to a specific slide index */
    goTo(index) {
      if (index === this.currentIndex) return;

      const prev = this.slides[this.currentIndex];
      const next = this.slides[clamp(index, 0, this.total - 1)];

      // Fade out current slide
      prev.classList.remove("active");
      // Fade in next slide
      next.classList.add("active");

      this.currentIndex = clamp(index, 0, this.total - 1);
      this._updateDots();
      this._updateCounter();
    }

    /** Advance to the next slide, wrapping around */
    next() {
      const nextIndex = (this.currentIndex + 1) % this.total;
      this.goTo(nextIndex);
    }

    /** Go to the previous slide, wrapping around */
    prev() {
      const prevIndex = (this.currentIndex - 1 + this.total) % this.total;
      this.goTo(prevIndex);
    }

    /* ---- Dots ---- */

    _updateDots() {
      if (!this.dots) return;
      this.dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === this.currentIndex);
      });
    }

    _updateCounter() {
      if (this.counterCurrent) {
        this.counterCurrent.textContent = String(this.currentIndex + 1).padStart(2, "0");
      }
    }

    /* ---- Auto-play ---- */

    _startAuto() {
      this._stopAuto();
      this._timer = setInterval(() => {
        if (!this._paused) this.next();
      }, this.interval);
    }

    _stopAuto() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }

    _pause() {
      this._paused = true;
    }

    _resume() {
      this._paused = false;
    }

    /* ---- Touch / Swipe ---- */

    _onTouchStart(e) {
      this._touchStartX = e.changedTouches[0].clientX;
    }

    _onTouchEnd(e) {
      this._touchEndX = e.changedTouches[0].clientX;
      const diff = this._touchStartX - this._touchEndX;

      // Minimum swipe distance (px)
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next(); // swipe left → next
        } else {
          this.prev(); // swipe right → prev
        }
      }
    }

    /* ---- Keyboard ---- */

    _onKeyDown(e) {
      if (e.key === "ArrowLeft") {
        this.prev();
      } else if (e.key === "ArrowRight") {
        this.next();
      }
    }

    /* ---- Event Binding ---- */

    _bindEvents() {
      // Previous / Next buttons
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => this.next());
      }

      // Dot pagination
      this.dots.forEach((dot, i) => {
        dot.addEventListener("click", () => this.goTo(i));
      });

      // Pause on hover
      this.el.addEventListener("mouseenter", () => this._pause());
      this.el.addEventListener("mouseleave", () => this._resume());

      // Touch / Swipe (mobile)
      this.el.addEventListener("touchstart", (e) => this._onTouchStart(e), { passive: true });
      this.el.addEventListener("touchend", (e) => this._onTouchEnd(e), { passive: true });

      // Keyboard navigation (when slider or its children are focused)
      this.el.setAttribute("tabindex", "0");
      this.el.addEventListener("keydown", (e) => this._onKeyDown(e));

      // Pause when page is hidden (saves resources)
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this._stopAuto();
        } else {
          this._startAuto();
        }
      });
    }

    /* ---- Public teardown ---- */

    destroy() {
      this._stopAuto();
      this.el.removeEventListener("mouseenter", this._pause);
      this.el.removeEventListener("mouseleave", this._resume);
    }
  }

  /* ============================================================
     2. TESTIMONIAL SLIDER
     ============================================================ */
  class TestimonialSlider {
    /**
     * @param {HTMLElement} el – .testimonial-slider wrapper
     * @param {Object} opts
     */
    constructor(el, opts = {}) {
      if (!el) return;

      this.el = el;
      this.track = $(".testimonial-track", el) || el;
      this.items = $$(".testimonial-item", this.track);
      this.prevBtn = $(".testimonial-btn.prev", el) || $(".testimonial-btn--prev", el);
      this.nextBtn = $(".testimonial-btn.next", el) || $(".testimonial-btn--next", el);

      if (!this.items.length) return;

      this.interval = opts.interval || 6000;
      this.currentIndex = 0;
      this._timer = null;
      this._paused = false;

      this._init();
    }

    _init() {
      this._showItem(0);
      this._bindEvents();
      this._startAuto();
    }

    _showItem(index) {
      this.items.forEach((item, i) => {
        item.style.display = i === index ? "" : "none";
        item.classList.toggle("active", i === index);
      });
      this.currentIndex = index;
    }

    next() {
      const idx = (this.currentIndex + 1) % this.items.length;
      this._showItem(idx);
    }

    prev() {
      const idx = (this.currentIndex - 1 + this.items.length) % this.items.length;
      this._showItem(idx);
    }

    _startAuto() {
      this._stopAuto();
      this._timer = setInterval(() => {
        if (!this._paused) this.next();
      }, this.interval);
    }

    _stopAuto() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    }

    _bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => this.prev());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => this.next());
      }

      this.el.addEventListener("mouseenter", () => { this._paused = true; });
      this.el.addEventListener("mouseleave", () => { this._paused = false; });

      // Respect page visibility
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this._stopAuto();
        } else {
          this._startAuto();
        }
      });
    }

    destroy() {
      this._stopAuto();
    }
  }

  /* ============================================================
     3. PARTNERS / BRAND LOGO SLIDER  (infinite auto-scroll)
     ============================================================ */
  class PartnersSlider {
    /**
     * @param {HTMLElement} el – .partners-slider wrapper containing .partners-track
     * @param {Object} opts
     */
    constructor(el, opts = {}) {
      if (!el) return;

      this.el = el;
      this.track = $(".partners-track", el);
      if (!this.track) return;

      this.speed = opts.speed || 1;          // px per frame
      this._raf = null;
      this._paused = false;
      this._pausedByVisibility = false;

      this._init();
    }

    _init() {
      // Duplicate track children so the scroll loops seamlessly
      const children = Array.from(this.track.children);
      children.forEach((child) => {
        this.track.appendChild(child.cloneNode(true));
      });

      this._bindEvents();
      this._scroll();
    }

    _scroll() {
      const step = () => {
        if (!this._paused && !this._pausedByVisibility) {
          // If we've scrolled past the original set, reset position
          if (this.track.scrollLeft >= this.track.scrollWidth / 2) {
            this.track.scrollLeft = 0;
          }
          this.track.scrollLeft += this.speed;
        }
        this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    }

    _bindEvents() {
      this.el.addEventListener("mouseenter", () => { this._paused = true; });
      this.el.addEventListener("mouseleave", () => { this._paused = false; });

      // Pause on touch (mobile tap-and-drag)
      this.el.addEventListener("touchstart", () => { this._paused = true; }, { passive: true });
      this.el.addEventListener("touchend", () => { this._paused = false; }, { passive: true });

      document.addEventListener("visibilitychange", () => {
        this._pausedByVisibility = document.hidden;
      });
    }

    destroy() {
      if (this._raf) cancelAnimationFrame(this._raf);
    }
  }

  /* ============================================================
     4. FLEET CAROUSEL  (horizontal scroll with arrow buttons)
     ============================================================ */
  class FleetCarousel {
    /**
     * @param {HTMLElement} el – .fleet-slider wrapper
     * @param {Object} opts
     */
    constructor(el, opts = {}) {
      if (!el) return;

      this.el = el;
      this.track = $(".fleet-track", el) || el;
      this.prevBtn = $(".fleet-btn.prev", el) || $(".fleet-btn--prev", el);
      this.nextBtn = $(".fleet-btn.next", el) || $(".fleet-btn--next", el);

      this.scrollAmount = opts.scrollAmount || 320; // px per click
      this._paused = false;

      this._init();
    }

    _init() {
      this._bindEvents();
    }

    scrollLeft() {
      this.track.scrollBy({ left: -this.scrollAmount, behavior: "smooth" });
    }

    scrollRight() {
      this.track.scrollBy({ left: this.scrollAmount, behavior: "smooth" });
    }

    _bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", () => this.scrollLeft());
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", () => this.scrollRight());
      }

      // Pause auto-scroll if a timer-based extension is added later
      this.el.addEventListener("mouseenter", () => { this._paused = true; });
      this.el.addEventListener("mouseleave", () => { this._paused = false; });

      // Keyboard support when focused
      this.el.setAttribute("tabindex", "0");
      this.el.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.scrollLeft();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          this.scrollRight();
        }
      });
    }

    destroy() {
      // nothing special to clean up
    }
  }

  /* ============================================================
     BOOT – Initialise all sliders when the DOM is ready
     ============================================================ */
  function initSliders() {
    // Hero
    const heroEl = $(".hero-slider");
    if (heroEl) {
      window.heroSlider = new HeroSlider(heroEl);
    }

    // Testimonials
    const testimonialEl = $(".testimonial-slider");
    if (testimonialEl) {
      window.testimonialSlider = new TestimonialSlider(testimonialEl);
    }

    // Partners / Brand logos
    const partnersEl = $(".partners-slider");
    if (partnersEl) {
      window.partnersSlider = new PartnersSlider(partnersEl);
    }

    // Fleet carousel
    const fleetEl = $(".fleet-slider");
    if (fleetEl) {
      window.fleetCarousel = new FleetCarousel(fleetEl);
    }
  }

  // Kick off once DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSliders);
  } else {
    initSliders();
  }

  // Expose classes globally for external use / testing
  window.StacklySliders = {
    HeroSlider,
    TestimonialSlider,
    PartnersSlider,
    FleetCarousel,
  };
})();
