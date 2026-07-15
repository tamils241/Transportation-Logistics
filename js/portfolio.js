/**
 * Portfolio Filter & Lightbox - Stackly Transportation & Logistics
 * Handles category filtering with transitions and full-screen image lightbox
 */

(function () {
    'use strict';

    // ---------------------------------------------------------------
    // Portfolio Filter
    // ---------------------------------------------------------------

    const filterConfig = {
        buttonSelector: '.filter-btn',
        cardSelector: '.portfolio-card',
        activeClass: 'active',
        allFilter: 'all',
        transitionDuration: 300,
    };

    function initPortfolioFilter() {
        const filterButtons = document.querySelectorAll(filterConfig.buttonSelector);
        const portfolioCards = document.querySelectorAll(filterConfig.cardSelector);

        if (filterButtons.length === 0 || portfolioCards.length === 0) return;

        filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const filter = btn.getAttribute('data-filter') || filterConfig.allFilter;

                // Update active button
                filterButtons.forEach(function (b) {
                    b.classList.remove(filterConfig.activeClass);
                });
                btn.classList.add(filterConfig.activeClass);

                // Filter items with animation
                filterItems(portfolioCards, filter);
            });
        });
    }

    function filterItems(cards, filter) {
        const isAll = filter === filterConfig.allFilter;

        cards.forEach(function (card) {
            const category = card.getAttribute('data-category') || '';
            const shouldShow = isAll || category === filter;

            if (shouldShow) {
                // Show with animation
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                card.style.display = '';

                // Trigger reflow then animate in
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        card.style.transition = 'opacity ' + filterConfig.transitionDuration + 'ms ease, transform ' + filterConfig.transitionDuration + 'ms ease';
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    });
                });
            } else {
                // Fade out then hide
                card.style.transition = 'opacity ' + filterConfig.transitionDuration + 'ms ease, transform ' + filterConfig.transitionDuration + 'ms ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';

                setTimeout(function () {
                    card.style.display = 'none';
                }, filterConfig.transitionDuration);
            }
        });
    }

    // ---------------------------------------------------------------
    // Lightbox
    // ---------------------------------------------------------------

    const lightboxConfig = {
        overlaySelector: '.lightbox-overlay',
        imageSelector: '.lightbox-image',
        captionSelector: '.lightbox-caption',
        closeSelector: '.lightbox-close',
        prevSelector: '.lightbox-prev',
        nextSelector: '.lightbox-next',
        cardImageSelector: '.portfolio-card img, .portfolio-card .card-image',
        cardSelector: '.portfolio-card',
        activeClass: 'active',
    };

    let lightboxState = {
        isOpen: false,
        currentIndex: 0,
        items: [],
    };

    function createLightbox() {
        // Don't create duplicates
        if (document.querySelector(lightboxConfig.overlaySelector)) return;

        var overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Image lightbox');

        overlay.innerHTML =
            '<button class="lightbox-close" aria-label="Close lightbox">&times;</button>' +
            '<button class="lightbox-prev" aria-label="Previous image">&#8249;</button>' +
            '<button class="lightbox-next" aria-label="Next image">&#8250;</button>' +
            '<div class="lightbox-content">' +
            '  <img class="lightbox-image" src="" alt="">' +
            '  <p class="lightbox-caption"></p>' +
            '</div>';

        document.body.appendChild(overlay);

        // Event listeners
        overlay.querySelector(lightboxConfig.closeSelector).addEventListener('click', closeLightbox);
        overlay.querySelector(lightboxConfig.prevSelector).addEventListener('click', function () { navigateLightbox(-1); });
        overlay.querySelector(lightboxConfig.nextSelector).addEventListener('click', function () { navigateLightbox(1); });

        // Close on overlay background click
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) {
                closeLightbox();
            }
        });

        // Prevent content clicks from closing
        overlay.querySelector('.lightbox-content').addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    function openLightbox(index) {
        var overlay = document.querySelector(lightboxConfig.overlaySelector);
        if (!overlay) return;

        // Gather all currently visible portfolio cards
        lightboxState.items = Array.from(document.querySelectorAll(lightboxConfig.cardSelector)).filter(function (card) {
            return card.style.display !== 'none';
        });
        lightboxState.currentIndex = index;
        lightboxState.isOpen = true;

        updateLightboxContent();
        overlay.classList.add(lightboxConfig.activeClass);
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        var overlay = document.querySelector(lightboxConfig.overlaySelector);
        if (!overlay) return;

        overlay.classList.remove(lightboxConfig.activeClass);
        document.body.style.overflow = '';
        lightboxState.isOpen = false;
    }

    function navigateLightbox(direction) {
        if (!lightboxState.isOpen || lightboxState.items.length === 0) return;

        lightboxState.currentIndex += direction;

        // Wrap around
        if (lightboxState.currentIndex < 0) {
            lightboxState.currentIndex = lightboxState.items.length - 1;
        } else if (lightboxState.currentIndex >= lightboxState.items.length) {
            lightboxState.currentIndex = 0;
        }

        updateLightboxContent();
    }

    function updateLightboxContent() {
        var item = lightboxState.items[lightboxState.currentIndex];
        if (!item) return;

        var overlay = document.querySelector(lightboxConfig.overlaySelector);
        var img = overlay.querySelector(lightboxConfig.imageSelector);
        var caption = overlay.querySelector(lightboxConfig.captionSelector);

        var imgEl = item.querySelector('img');
        var imageSrc = '';
        var imageAlt = '';
        var title = '';

        if (imgEl) {
            // Use data-full or data-original for high-res, fall back to src
            imageSrc = imgEl.getAttribute('data-full') || imgEl.getAttribute('data-original') || imgEl.src;
            imageAlt = imgEl.alt || '';
        } else {
            // Fallback for card-image divs with background image
            var cardImage = item.querySelector('.card-image');
            if (cardImage) {
                var bg = window.getComputedStyle(cardImage).backgroundImage;
                imageSrc = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
                imageAlt = cardImage.getAttribute('data-alt') || '';
            }
        }

        // Get caption text from data-caption or card title
        title = item.getAttribute('data-caption') || item.querySelector('h3, h4, .card-title, .portfolio-title');
        if (title && title.textContent) {
            title = title.textContent.trim();
        } else if (typeof title !== 'string') {
            title = imageAlt;
        }

        img.src = imageSrc;
        img.alt = imageAlt;
        caption.textContent = title || '';
    }

    function initLightbox() {
        createLightbox();

        var cards = document.querySelectorAll(lightboxConfig.cardSelector);
        cards.forEach(function (card, index) {
            card.style.cursor = 'pointer';

            card.addEventListener('click', function (e) {
                // Don't open if clicking a link or button inside
                if (e.target.closest('a, button')) return;

                // Only open for visible cards
                if (card.style.display === 'none') return;

                openLightbox(index);
            });
        });
    }

    // ---------------------------------------------------------------
    // Keyboard Navigation
    // ---------------------------------------------------------------

    function initKeyboard() {
        document.addEventListener('keydown', function (e) {
            if (!lightboxState.isOpen) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    navigateLightbox(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    navigateLightbox(1);
                    break;
            }
        });
    }

    // ---------------------------------------------------------------
    // Initialize Everything
    // ---------------------------------------------------------------

    function init() {
        initPortfolioFilter();
        initLightbox();
        initKeyboard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
