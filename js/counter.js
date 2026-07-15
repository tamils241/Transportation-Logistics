/**
 * Stackly Transportation & Logistics - Animated Counter
 * Handles animated number counters, progress bars, and circular progress indicators
 */

(function () {
  'use strict';

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  /**
   * EaseOutQuart easing function for smooth deceleration
   * @param {number} t - Progress value (0 to 1)
   * @returns {number} Eased value
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * Format number with commas (e.g., 1500 -> "1,500")
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  function formatNumber(num) {
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Check if element is in viewport
   * @param {HTMLElement} element - DOM element to check
   * @returns {boolean} True if element is visible
   */
  function isInViewport(element) {
    var rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.bottom >= 0
    );
  }

  // =====================================================
  // NUMBER COUNTER ANIMATION
  // =====================================================

  /**
   * AnimatedCounter class for counting up numbers
   * @param {HTMLElement} element - The counter DOM element
   */
  function AnimatedCounter(element) {
    this.element = element;
    this.target = parseInt(element.getAttribute('data-count'), 10) || 0;
    this.suffix = element.getAttribute('data-suffix') || '';
    this.prefix = element.getAttribute('data-prefix') || '';
    this.duration = parseInt(element.getAttribute('data-duration'), 10) || 2000;
    this.animated = false;
    this.startTime = null;
    this.animationFrame = null;
  }

  /**
   * Start the counter animation
   */
  AnimatedCounter.prototype.animate = function () {
    if (this.animated) return;

    this.animated = true;
    this.startTime = performance.now();
    this.element.classList.add('counter-active');
    this.tick();
  };

  /**
   * Animation frame tick handler
   */
  AnimatedCounter.prototype.tick = function () {
    var self = this;
    var currentTime = performance.now();
    var elapsed = currentTime - this.startTime;
    var progress = Math.min(elapsed / this.duration, 1);
    var easedProgress = easeOutQuart(progress);
    var currentValue = easedProgress * this.target;

    this.element.textContent = this.prefix + formatNumber(currentValue) + this.suffix;

    if (progress < 1) {
      this.animationFrame = requestAnimationFrame(function () {
        self.tick();
      });
    } else {
      this.element.textContent = this.prefix + formatNumber(this.target) + this.suffix;
      this.element.classList.add('counter-complete');
      this.element.classList.remove('counter-active');
    }
  };

  /**
   * Cancel ongoing animation
   */
  AnimatedCounter.prototype.cancel = function () {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  };

  // =====================================================
  // PROGRESS BAR ANIMATION
  // =====================================================

  /**
   * Animate progress bar fill elements
   * Elements should have class .progress-bar-fill and data-width attribute (0-100)
   */
  function initProgressBars() {
    var progressBars = document.querySelectorAll('.progress-bar-fill');

    if (!progressBars.length) return;

    var progressBarObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var bar = entry.target;
            var targetWidth = bar.getAttribute('data-width') || '0';
            bar.style.width = targetWidth + '%';
            bar.classList.add('progress-bar-animated');
            progressBarObserver.unobserve(bar);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    progressBars.forEach(function (bar) {
      bar.style.width = '0%';
      bar.style.transition = 'width 1.5s ease-out';
      progressBarObserver.observe(bar);
    });
  }

  // =====================================================
  // CIRCULAR PROGRESS ANIMATION (SVG)
  // =====================================================

  /**
   * Animate SVG circular progress elements
   * Each SVG circle should have:
   * - data-progress attribute (0-100) for target percentage
   * - A radius attribute to calculate circumference
   */
  function initCircularProgress() {
    var circles = document.querySelectorAll('.circular-progress-circle');

    if (!circles.length) return;

    var circleObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCircle(entry.target);
            circleObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    circles.forEach(function (circle) {
      var radius = parseFloat(circle.getAttribute('r')) || 45;
      var circumference = 2 * Math.PI * radius;

      circle.style.strokeDasharray = circumference;
      circle.style.strokeDashoffset = circumference;
      circle.style.transition = 'stroke-dashoffset 2s ease-out';

      circleObserver.observe(circle);
    });
  }

  /**
   * Animate a single SVG circle to its target progress
   * @param {SVGElement} circle - The SVG circle element
   */
  function animateCircle(circle) {
    var radius = parseFloat(circle.getAttribute('r')) || 45;
    var circumference = 2 * Math.PI * radius;
    var targetProgress = parseFloat(circle.getAttribute('data-progress')) || 0;
    var offset = circumference - (targetProgress / 100) * circumference;

    circle.style.strokeDashoffset = offset;

    // Also update the associated percentage text if present
    var parent = circle.closest('.circular-progress');
    if (parent) {
      var textEl = parent.querySelector('.circular-progress-text');
      if (textEl) {
        animateCircleText(textEl, targetProgress);
      }
    }
  }

  /**
   * Animate the text inside circular progress
   * @param {HTMLElement} element - The text element
   * @param {number} target - Target percentage value
   */
  function animateCircleText(element, target) {
    var duration = 2000;
    var startTime = performance.now();

    function tick() {
      var currentTime = performance.now();
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeOutQuart(progress);
      var currentValue = easedProgress * target;

      element.textContent = Math.round(currentValue) + '%';

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        element.textContent = Math.round(target) + '%';
      }
    }

    requestAnimationFrame(tick);
  }

  // =====================================================
  // COUNTER INITIALIZATION
  // =====================================================

  /**
   * Initialize all counter elements on the page
   */
  function initCounters() {
    var counterElements = document.querySelectorAll('.counter, [data-count]');

    if (!counterElements.length) return;

    var counters = [];

    counterElements.forEach(function (el) {
      var counter = new AnimatedCounter(el);
      counters.push(counter);

      // Set initial display
      el.textContent = counter.prefix + '0' + counter.suffix;
    });

    // Create IntersectionObserver for counters
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Find the counter object for this element
            var counter = counters.find(function (c) {
              return c.element === entry.target;
            });

            if (counter && !counter.animated) {
              counter.animate();
            }

            counterObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    counterElements.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  // =====================================================
  // INITIALIZATION ON DOM READY
  // =====================================================

  function init() {
    initCounters();
    initProgressBars();
    initCircularProgress();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
