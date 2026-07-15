/**
 * FAQ Accordion - Stackly Transportation & Logistics
 * Handles accordion toggle, search filtering, and category filtering
 */

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        accordion: {
            closeOthers: true,            // Close other items when one opens
            activeClass: 'active',
            itemSelector: '.faq-item',
            questionSelector: '.faq-question',
            answerSelector: '.faq-answer',
        },
        search: {
            inputSelector: '#faq-search',
            debounceDelay: 250,
            noResultsMessage: 'No results found',
        },
        category: {
            buttonSelector: '.category-btn',
            allCategory: 'all',
            activeCategoryClass: 'active',
        },
    };

    // ---------------------------------------------------------------
    // Accordion Toggle
    // ---------------------------------------------------------------

    function toggleAccordionItem(item) {
        const isActive = item.classList.contains(CONFIG.accordion.activeClass);
        const answer = item.querySelector(CONFIG.accordion.answerSelector);
        const question = item.querySelector(CONFIG.accordion.questionSelector);

        if (isActive) {
            // Collapse
            item.classList.remove(CONFIG.accordion.activeClass);
            answer.style.maxHeight = null;
            question.setAttribute('aria-expanded', 'false');
        } else {
            // Close others if configured
            if (CONFIG.accordion.closeOthers) {
                const allItems = document.querySelectorAll(CONFIG.accordion.itemSelector);
                allItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove(CONFIG.accordion.activeClass);
                        const otherAnswer = otherItem.querySelector(CONFIG.accordion.answerSelector);
                        const otherQuestion = otherItem.querySelector(CONFIG.accordion.questionSelector);
                        if (otherAnswer) otherAnswer.style.maxHeight = null;
                        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
                    }
                });
            }

            // Expand clicked item
            item.classList.add(CONFIG.accordion.activeClass);
            answer.style.maxHeight = answer.scrollHeight + 'px';
            question.setAttribute('aria-expanded', 'true');
        }
    }

    function initAccordion() {
        const faqItems = document.querySelectorAll(CONFIG.accordion.itemSelector);

        faqItems.forEach(function (item) {
            const question = item.querySelector(CONFIG.accordion.questionSelector);
            const answer = item.querySelector(CONFIG.accordion.answerSelector);

            if (!question || !answer) return;

            // Set initial ARIA attributes
            question.setAttribute('aria-expanded', 'false');
            question.setAttribute('role', 'button');
            question.setAttribute('tabindex', '0');
            answer.setAttribute('role', 'region');

            // Click handler
            question.addEventListener('click', function () {
                toggleAccordionItem(item);
            });

            // Keyboard support
            question.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordionItem(item);
                }
            });
        });
    }

    // ---------------------------------------------------------------
    // FAQ Search
    // ---------------------------------------------------------------

    function debounce(fn, delay) {
        let timer;
        return function () {
            var context = this;
            var args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    function filterBySearch(query) {
        const faqItems = document.querySelectorAll(CONFIG.accordion.itemSelector);
        const normalizedQuery = query.toLowerCase().trim();
        let visibleCount = 0;

        faqItems.forEach(function (item) {
            const questionEl = item.querySelector(CONFIG.accordion.questionSelector);
            const answerEl = item.querySelector(CONFIG.accordion.answerSelector);

            const questionText = questionEl ? questionEl.textContent.toLowerCase() : '';
            const answerText = answerEl ? answerEl.textContent.toLowerCase() : '';

            if (!normalizedQuery || questionText.includes(normalizedQuery) || answerText.includes(normalizedQuery)) {
                item.style.display = '';
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.style.display = 'none';
                item.classList.add('hidden');

                // Collapse hidden items
                item.classList.remove(CONFIG.accordion.activeClass);
                if (answerEl) answerEl.style.maxHeight = null;
                if (questionEl) questionEl.setAttribute('aria-expanded', 'false');
            }
        });

        // Show / hide no-results message
        toggleNoResults(visibleCount === 0 && normalizedQuery !== '');
    }

    function toggleNoResults(show) {
        let noResultsEl = document.querySelector('.faq-no-results');

        if (show) {
            if (!noResultsEl) {
                noResultsEl = document.createElement('div');
                noResultsEl.className = 'faq-no-results';
                noResultsEl.textContent = CONFIG.search.noResultsMessage;

                const container = document.querySelector('.faq-list') || document.querySelector('.faq-container');
                if (container) container.appendChild(noResultsEl);
            }
            noResultsEl.style.display = 'block';
        } else if (noResultsEl) {
            noResultsEl.style.display = 'none';
        }
    }

    function initSearch() {
        const searchInput = document.querySelector(CONFIG.search.inputSelector);
        if (!searchInput) return;

        var debouncedFilter = debounce(function () {
            filterBySearch(searchInput.value);
        }, CONFIG.search.debounceDelay);

        searchInput.addEventListener('input', debouncedFilter);
    }

    // ---------------------------------------------------------------
    // Category Filter
    // ---------------------------------------------------------------

    function filterByCategory(category) {
        const faqItems = document.querySelectorAll(CONFIG.accordion.itemSelector);
        const isAll = category === CONFIG.category.allCategory;
        let visibleCount = 0;

        faqItems.forEach(function (item) {
            const itemCategory = item.getAttribute('data-category') || '';

            if (isAll || itemCategory === category || itemCategory === '') {
                item.style.display = '';
                item.classList.remove('hidden');
                visibleCount++;
            } else {
                item.style.display = 'none';
                item.classList.add('hidden');

                // Collapse hidden items
                item.classList.remove(CONFIG.accordion.activeClass);
                const answerEl = item.querySelector(CONFIG.accordion.answerSelector);
                const questionEl = item.querySelector(CONFIG.accordion.questionSelector);
                if (answerEl) answerEl.style.maxHeight = null;
                if (questionEl) questionEl.setAttribute('aria-expanded', 'false');
            }
        });

        toggleNoResults(visibleCount === 0);
    }

    function initCategoryFilter() {
        const categoryButtons = document.querySelectorAll(CONFIG.category.buttonSelector);
        if (categoryButtons.length === 0) return;

        categoryButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                // Update active button state
                categoryButtons.forEach(function (b) {
                    b.classList.remove(CONFIG.category.activeCategoryClass);
                });
                btn.classList.add(CONFIG.category.activeCategoryClass);

                // Filter items
                const category = btn.getAttribute('data-filter') || CONFIG.category.allCategory;
                filterByCategory(category);

                // Also apply current search query
                const searchInput = document.querySelector(CONFIG.search.inputSelector);
                if (searchInput && searchInput.value) {
                    filterBySearch(searchInput.value);
                }
            });
        });
    }

    // ---------------------------------------------------------------
    // Initialize
    // ---------------------------------------------------------------

    function init() {
        initAccordion();
        initSearch();
        initCategoryFilter();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
