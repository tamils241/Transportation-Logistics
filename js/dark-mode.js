/**
 * Stackly Transportation & Logistics - Dark Mode Toggle
 * Manages dark/light theme switching with persistence.
 *
 * Features: Toggle via button, localStorage persistence,
 * system preference detection, icon swap, smooth transitions,
 * and custom event dispatching.
 */

(function () {
  "use strict";

  var STORAGE_KEY = "stackly-theme";
  var DARK_CLASS = "dark-mode";

  // ─── Initialization ────────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    bindToggle();
  });

  // ─── 1. Initialize Theme on Load ───────────────────────────────────────────

  /**
   * Determine the initial theme:
   * 1. Use saved localStorage preference if available.
   * 2. Fall back to the system prefers-color-scheme setting.
   * 3. Default to light.
   */
  function initTheme() {
    addTransition();

    var saved = localStorage.getItem(STORAGE_KEY);
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (saved === "dark" || (!saved && prefersDark)) {
      document.body.classList.add(DARK_CLASS);
    }

    updateIcon();
  }

  // ─── 2. Bind Toggle Button(s) ──────────────────────────────────────────────

  /**
   * Attach click handlers to all toggle buttons matching:
   * - .dark-mode-toggle button
   * - [data-theme-toggle]
   */
  function bindToggle() {
    var toggles = document.querySelectorAll(
      ".dark-mode-toggle button, [data-theme-toggle]"
    );

    toggles.forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });
  }

  // ─── 3. Toggle Theme ───────────────────────────────────────────────────────

  /**
   * Flip the dark-mode class on body, persist the choice,
   * update the icon, and dispatch a custom event.
   */
  function toggleTheme() {
    document.body.classList.toggle(DARK_CLASS);

    var isDark = document.body.classList.contains(DARK_CLASS);

    // Persist preference
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");

    updateIcon();

    // Dispatch custom event for other scripts to react
    var event;
    try {
      event = new CustomEvent("themeChanged", {
        detail: { dark: isDark },
      });
    } catch (err) {
      // IE11 fallback
      event = document.createEvent("CustomEvent");
      event.initCustomEvent("themeChanged", true, true, { dark: isDark });
    }

    document.dispatchEvent(event);
  }

  // ─── 4. Update Toggle Icon ─────────────────────────────────────────────────

  /**
   * Swap between fa-moon (show when light → click to go dark)
   * and fa-sun  (show when dark  → click to go light)
   * on every toggle button found on the page.
   */
  function updateIcon() {
    var isDark = document.body.classList.contains(DARK_CLASS);
    var icons = document.querySelectorAll(
      ".dark-mode-toggle button i, [data-theme-toggle] i"
    );

    icons.forEach(function (icon) {
      icon.classList.remove("fa-sun", "fa-moon");
      icon.classList.add(isDark ? "fa-sun" : "fa-moon");
    });
  }

  // ─── 5. Smooth Transition on Toggle ────────────────────────────────────────

  /**
   * Add a brief CSS transition on body so colour changes
   * animate smoothly rather than snapping.
   */
  function addTransition() {
    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";
  }
})();
