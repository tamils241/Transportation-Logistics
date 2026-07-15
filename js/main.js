/**
 * Stackly Transportation & Logistics - Main JavaScript
 * Core interactive features for the website.
 *
 * Features: Page loader, sticky header, mobile nav, dropdowns,
 * mega menu, back-to-top, search popup, smooth scroll, scroll reveal,
 * active nav links, and tooltips.
 */

(function () {
  "use strict";

  // ─── DOM Ready ───────────────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    pageLoader();
    stickyHeader();
    mobileNavigation();
    dropdownNavigation();
    megaMenu();
    backToTop();
    searchPopup();
    smoothScrolling();
    preventEmptyLinks();
    scrollReveal();
    activeNavLink();
    tooltip();
  }

  // ─── 1. Page Loader ─────────────────────────────────────────────────────────

  function pageLoader() {
    const loader = document.querySelector(".page-loader");
    if (!loader) return;

    window.addEventListener("load", function () {
      loader.style.transition = "opacity 0.4s ease";
      loader.style.opacity = "0";

      setTimeout(function () {
        loader.style.display = "none";
      }, 400);
    });
  }

  // ─── 2. Sticky Header ───────────────────────────────────────────────────────

  function stickyHeader() {
    const header = document.querySelector(".header");
    if (!header) return;

    var scrollThreshold = 50;

    function handleScroll() {
      if (window.scrollY > scrollThreshold) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  // ─── 3. Mobile Navigation ───────────────────────────────────────────────────

  function mobileNavigation() {
    var toggle = document.querySelector(".mobile-toggle");
    var navMenu = document.querySelector(".nav-menu");
    if (!toggle || !navMenu) return;

    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      toggle.classList.toggle("active");
      navMenu.classList.toggle("active");
      document.body.classList.toggle("mobile-open");
    });

    // Close menu when a nav link is clicked
    var navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        toggle.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.classList.remove("mobile-open");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (e) {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        toggle.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.classList.remove("mobile-open");
      }
    });
  }

  // ─── 4. Dropdown Navigation ─────────────────────────────────────────────────

  function dropdownNavigation() {
    var dropdowns = document.querySelectorAll(".nav-dropdown");
    if (!dropdowns.length) return;

    dropdowns.forEach(function (dropdown) {
      var trigger = dropdown.querySelector("a");
      if (!trigger) return;

      trigger.addEventListener("click", function (e) {
        // Only toggle on mobile (screen width <= 991px)
        if (window.innerWidth > 991) return;

        e.preventDefault();
        e.stopPropagation();

        // Close other open dropdowns
        dropdowns.forEach(function (other) {
          if (other !== dropdown && other.classList.contains("active")) {
            other.classList.remove("active");
          }
        });

        dropdown.classList.toggle("active");
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-dropdown")) {
        dropdowns.forEach(function (dropdown) {
          dropdown.classList.remove("active");
        });
      }
    });
  }

  // ─── 5. Mega Menu ───────────────────────────────────────────────────────────

  function megaMenu() {
    var megaMenus = document.querySelectorAll(".mega-menu");
    if (!megaMenus.length) return;

    megaMenus.forEach(function (mega) {
      var trigger = mega.querySelector("a");
      if (!trigger) return;

      trigger.addEventListener("click", function (e) {
        if (window.innerWidth > 991) return;

        e.preventDefault();
        e.stopPropagation();

        // Close other mega menus
        megaMenus.forEach(function (other) {
          if (other !== mega && other.classList.contains("active")) {
            other.classList.remove("active");
          }
        });

        mega.classList.toggle("active");
      });
    });

    // Close mega menus when clicking outside
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".mega-menu")) {
        megaMenus.forEach(function (mega) {
          mega.classList.remove("active");
        });
      }
    });
  }

  // ─── 6. Back To Top Button ──────────────────────────────────────────────────

  function backToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;

    var scrollThreshold = 400;

    function toggleButton() {
      if (window.scrollY > scrollThreshold) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }

    window.addEventListener("scroll", toggleButton, { passive: true });
    toggleButton();

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // ─── 7. Search Popup ────────────────────────────────────────────────────────

  function searchPopup() {
    var popup = document.querySelector(".search-popup");
    var openBtn = document.querySelector(".header-search-btn");
    var closeBtn = document.querySelector(".search-popup-close");
    var overlay = document.querySelector(".search-popup-overlay");

    if (!popup || !openBtn) return;

    function openPopup() {
      popup.classList.add("active");
      document.body.classList.add("search-open");

      // Focus the search input
      var input = popup.querySelector("input[type='search'], input[type='text']");
      if (input) {
        setTimeout(function () {
          input.focus();
        }, 100);
      }
    }

    function closePopup() {
      popup.classList.remove("active");
      document.body.classList.remove("search-open");
    }

    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openPopup();
    });

    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.preventDefault();
        closePopup();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", closePopup);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && popup.classList.contains("active")) {
        closePopup();
      }
    });
  }

  // ─── 8. Smooth Scrolling ────────────────────────────────────────────────────

  function smoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#" || targetId === "#0") return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var headerHeight =
          document.querySelector(".header") ?
            document.querySelector(".header").offsetHeight : 0;

        var targetPosition =
          target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      });
    });
  }

  // ─── 9. Prevent Empty Links ─────────────────────────────────────────────────

  function preventEmptyLinks() {
    document.querySelectorAll('a[href="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  // ─── 10. Scroll Reveal Animation ────────────────────────────────────────────

  function scrollReveal() {
    var revealSelectors =
      ".reveal, .reveal-left, .reveal-right, .reveal-zoom";
    var elements = document.querySelectorAll(revealSelectors);
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      // Fallback: show everything immediately
      elements.forEach(function (el) {
        el.classList.add("revealed");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─── 11. Active Navigation Link ─────────────────────────────────────────────

  function activeNavLink() {
    var navLinks = document.querySelectorAll(".nav-menu a");
    if (!navLinks.length) return;

    var currentPage = window.location.pathname.split("/").pop() || "index.html";

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;

      var linkPage = href.split("/").pop();

      if (linkPage === currentPage) {
        link.classList.add("active");

        // Also activate parent dropdown if present
        var parentDropdown = link.closest(".nav-dropdown");
        if (parentDropdown) {
          parentDropdown.classList.add("active");
        }
      }
    });
  }

  // ─── 12. Tooltip ────────────────────────────────────────────────────────────

  function tooltip() {
    var elements = document.querySelectorAll("[data-tooltip]");
    if (!elements.length) return;

    elements.forEach(function (el) {
      var tooltipText = el.getAttribute("data-tooltip");
      if (!tooltipText) return;

      var tooltipEl = null;

      function showTooltip() {
        tooltipEl = document.createElement("div");
        tooltipEl.className = "custom-tooltip";
        tooltipEl.textContent = tooltipText;
        document.body.appendChild(tooltipEl);

        var rect = el.getBoundingClientRect();
        tooltipEl.style.position = "absolute";
        tooltipEl.style.top =
          rect.top - tooltipEl.offsetHeight - 8 + window.scrollY + "px";
        tooltipEl.style.left =
          rect.left +
          (rect.width - tooltipEl.offsetWidth) / 2 +
          "px";
        tooltipEl.style.zIndex = "9999";
        tooltipEl.style.opacity = "0";
        tooltipEl.style.transition = "opacity 0.2s ease";
        tooltipEl.style.pointerEvents = "none";

        // Force reflow then fade in
        tooltipEl.offsetHeight;
        tooltipEl.style.opacity = "1";
      }

      function hideTooltip() {
        if (tooltipEl) {
          tooltipEl.remove();
          tooltipEl = null;
        }
      }

      el.addEventListener("mouseenter", showTooltip);
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("focus", showTooltip);
      el.addEventListener("blur", hideTooltip);
    });
  }
})();
