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

  var MOBILE_BREAKPOINT = 1024;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    localStorage.removeItem("stackly-theme");
    pageLoader();
    stickyHeader();
    mobileNavigation();
    backToTop();
    searchPopup();
    smoothScrolling();
    scrollReveal();
    activeNavLink();
    tooltip();
  }

  function pageLoader() {
    var loader = document.querySelector(".page-loader");
    if (!loader) return;

    window.addEventListener("load", function () {
      loader.style.transition = "opacity 0.4s ease";
      loader.style.opacity = "0";
      setTimeout(function () {
        loader.style.display = "none";
      }, 400);
    });
  }

  function stickyHeader() {
    var header = document.querySelector(".header");
    if (!header) return;

    function handleScroll() {
      header.classList.toggle("scrolled", window.scrollY > 50);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
  }

  function mobileNavigation() {
    var hamburger = document.getElementById("hamburger");
    var navMenu = document.getElementById("nav-menu");
    if (!hamburger || !navMenu) return;

    function setMenuState(isOpen) {
      hamburger.classList.toggle("active", isOpen);
      navMenu.classList.toggle("active", isOpen);
      document.body.classList.toggle("mobile-open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    }

    hamburger.addEventListener("click", function (e) {
      e.preventDefault();
      setMenuState(!hamburger.classList.contains("active"));
    });

    navMenu.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (!link || !navMenu.contains(link)) return;
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
        return;
      }
      setMenuState(false);
    });

    document.addEventListener("click", function (e) {
      if (
        navMenu.classList.contains("active") &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        setMenuState(false);
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        setMenuState(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        setMenuState(false);
      }
    });

    var dropdowns = document.querySelectorAll(".has-dropdown, .has-mega-menu");
    dropdowns.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
          this.classList.add("hovered");
        }
      });
      item.addEventListener("mouseleave", function () {
        if (window.innerWidth > MOBILE_BREAKPOINT) {
          this.classList.remove("hovered");
        }
      });
    });
  }

  function backToTop() {
    var btn = document.querySelector(".back-to-top");
    if (!btn) return;

    function toggleButton() {
      btn.classList.toggle("visible", window.scrollY > 400);
    }

    window.addEventListener("scroll", toggleButton, { passive: true });
    toggleButton();

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function searchPopup() {
    var popup = document.querySelector(".search-popup");
    var openBtn = document.querySelector(".header-search-btn");
    var closeBtn = document.querySelector(".search-popup-close");
    var overlay = document.querySelector(".search-popup-overlay");

    if (!popup || !openBtn) return;

    function openPopup() {
      popup.classList.add("active");
      document.body.classList.add("search-open");
      var input = popup.querySelector("input[type='search'], input[type='text']");
      if (input) setTimeout(function () { input.focus(); }, 100);
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

  function smoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var targetId = this.getAttribute("href");
        if (targetId === "#" || targetId === "#0") return;

        var target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        var header = document.querySelector(".header");
        var headerHeight = header ? header.offsetHeight : 0;
        var targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      });
    });
  }

  function scrollReveal() {
    var elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-zoom");
    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {
      elements.forEach(function (el) { el.classList.add("revealed"); });
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

    elements.forEach(function (el) { observer.observe(el); });
  }

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

        var parentDropdown = link.closest(".has-dropdown");
        if (parentDropdown) {
          parentDropdown.classList.add("active");
        }
      }
    });
  }

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
        tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 8 + window.scrollY + "px";
        tooltipEl.style.left = rect.left + (rect.width - tooltipEl.offsetWidth) / 2 + "px";
        tooltipEl.style.zIndex = "9999";
        tooltipEl.style.opacity = "0";
        tooltipEl.style.transition = "opacity 0.2s ease";
        tooltipEl.style.pointerEvents = "none";

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
