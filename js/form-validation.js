/**
 * Stackly Transportation & Logistics - Form Validation
 * Comprehensive client-side form validation with real-time feedback.
 *
 * Features: Validates .needs-validation / data-validate forms, email,
 * phone, password strength, min/max length, match fields, number range,
 * URL, real-time blur validation, phone auto-formatting, contact / newsletter
 * / login / registration form handlers, and password strength indicator.
 */

(function () {
  "use strict";

  // ─── DOM Ready ─────────────────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    injectValidationStyles();
    initFormValidation();
    initPhoneFormatting();
    initContactForm();
    initNewsletterForm();
    initLoginForm();
    initRegistrationForm();
    initPasswordToggles();
  }

  // ─── 0. Injected Validation Styles ─────────────────────────────────────────

  /**
   * Inject minimal CSS for validation feedback elements so the script
   * works even when the stylesheet does not include them yet.
   */
  function injectValidationStyles() {
    if (document.getElementById("stackly-validation-styles")) return;

    var style = document.createElement("style");
    style.id = "stackly-validation-styles";
    style.textContent = [
      ".invalid-feedback,",
      ".valid-feedback {",
      "  display: none;",
      "  font-size: 0.8125rem;",
      "  margin-top: 4px;",
      "  transition: var(--transition-fast);",
      "}",
      "",
      ".is-invalid ~ .invalid-feedback,",
      ".is-invalid + .invalid-feedback {",
      "  display: block;",
      "  color: var(--danger);",
      "}",
      "",
      ".is-valid ~ .valid-feedback,",
      ".is-valid + .valid-feedback {",
      "  display: block;",
      "  color: var(--success);",
      "}",
      "",
      ".form-control.is-invalid {",
      "  border-color: var(--danger);",
      "}",
      "",
      ".form-control.is-valid {",
      "  border-color: var(--success);",
      "}",
      "",
      ".password-strength {",
      "  display: flex;",
      "  gap: 4px;",
      "  margin-top: 8px;",
      "}",
      "",
      ".password-strength .bar {",
      "  flex: 1;",
      "  height: 4px;",
      "  border-radius: 2px;",
      "  background: var(--border);",
      "  transition: background 0.3s ease;",
      "}",
      "",
      ".password-strength[data-level='1'] .bar:nth-child(-n+1) { background: var(--danger); }",
      ".password-strength[data-level='2'] .bar:nth-child(-n+2) { background: var(--warning); }",
      ".password-strength[data-level='3'] .bar:nth-child(-n+3) { background: var(--info); }",
      ".password-strength[data-level='4'] .bar:nth-child(-n+4) { background: var(--success); }",
      "",
      ".password-strength-label {",
      "  font-size: 0.75rem;",
      "  margin-top: 4px;",
      "  font-weight: var(--fw-medium);",
      "}",
      "",
      ".password-strength[data-level='1'] + .password-strength-label { color: var(--danger); }",
      ".password-strength[data-level='2'] + .password-strength-label { color: var(--warning); }",
      ".password-strength[data-level='3'] + .password-strength-label { color: var(--info); }",
      ".password-strength[data-level='4'] + .password-strength-label { color: var(--success); }",
      "",
      ".form-success-msg {",
      "  display: none;",
      "  padding: 16px 20px;",
      "  border-radius: var(--radius-md);",
      "  background: rgba(39,174,96,0.08);",
      "  border: 1px solid rgba(39,174,96,0.25);",
      "  color: var(--success);",
      "  margin-top: 16px;",
      "  font-weight: var(--fw-medium);",
      "}",
      "",
      ".form-success-msg.visible { display: block; }"
    ].join("\n");

    document.head.appendChild(style);
  }

  // ─── 1. Core Form Validation Engine ────────────────────────────────────────

  /**
   * Find every form with .needs-validation or [data-validate] and wire up
   * submission prevention, per-field blur validation, and live typing
   * feedback after first blur.
   */
  function initFormValidation() {
    var forms = document.querySelectorAll(
      "form.needs-validation, form[data-validate]"
    );

    forms.forEach(function (form) {
      // Prevent native HTML5 validation bubbles — we handle everything
      form.setAttribute("novalidate", true);

      var fields = form.querySelectorAll(
        "input, textarea, select"
      );

      // Attach blur listeners for real-time validation
      fields.forEach(function (field) {
        // Validate on blur
        field.addEventListener("blur", function () {
          validateField(field);
        });

        // After first blur, validate on every input (live feedback)
        field.addEventListener(
          "input",
          createLiveValidator(field)
        );
      });

      // Intercept submit
      form.addEventListener("submit", function (e) {
        var isValid = validateForm(form);
        if (!isValid) {
          e.preventDefault();
          e.stopPropagation();

          // Scroll to first error
          var firstInvalid = form.querySelector(".is-invalid");
          if (firstInvalid) {
            firstInvalid.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
            firstInvalid.focus();
          }
        } else {
          // Allow default submit for forms without a custom handler
          // (contact, newsletter, etc. override this in their own listeners)
          if (!form.getAttribute("data-no-default-submit")) {
            return; // let native submit proceed
          }
          e.preventDefault();
        }
      });
    });
  }

  /**
   * Returns a handler that live-validates on input, but only after the
   * field has been blurred at least once (to avoid showing errors on
   * initial page load).
   */
  function createLiveValidator(field) {
    var touched = false;

    // Mark as touched after first blur
    field.addEventListener("blur", function markTouched() {
      touched = true;
      field.removeEventListener("blur", markTouched);
    });

    return function onInput() {
      if (!touched) return;
      validateField(field);
    };
  }

  // ─── 2. Field-Level Validation ─────────────────────────────────────────────

  /**
   * Validate a single field against all applicable rules.
   * Returns true if valid, false otherwise.
   */
  function validateField(field) {
    // Skip hidden / disabled fields
    if (field.disabled || field.type === "hidden") return true;

    var value = field.value.trim();
    var errors = [];

    // Required check
    if (isRequired(field) && !value) {
      errors.push("This field is required.");
    }

    // Only run further checks when a value is present
    if (value) {
      // Email
      if (field.getAttribute("data-type") === "email" || field.type === "email") {
        if (!isValidEmail(value)) {
          errors.push("Please enter a valid email address.");
        }
      }

      // Phone
      if (field.getAttribute("data-type") === "phone" || field.type === "tel") {
        if (!isValidPhone(value)) {
          errors.push("Please enter a valid phone number.");
        }
      }

      // URL
      if (field.getAttribute("data-type") === "url" || field.type === "url") {
        if (!isValidURL(value)) {
          errors.push("Please enter a valid URL.");
        }
      }

      // Min length
      var minLen = field.getAttribute("data-minlength") || field.getAttribute("minlength");
      if (minLen && value.length < parseInt(minLen, 10)) {
        errors.push("Must be at least " + minLen + " characters.");
      }

      // Max length
      var maxLen = field.getAttribute("data-maxlength") || field.getAttribute("maxlength");
      if (maxLen && value.length > parseInt(maxLen, 10)) {
        errors.push("Must be no more than " + maxLen + " characters.");
      }

      // Number range (data-min / data-max)
      if (field.getAttribute("data-min") !== null || field.getAttribute("data-max") !== null) {
        var num = parseFloat(value);
        if (isNaN(num)) {
          errors.push("Please enter a valid number.");
        } else {
          var min = parseFloat(field.getAttribute("data-min"));
          var max = parseFloat(field.getAttribute("data-max"));
          if (!isNaN(min) && num < min) {
            errors.push("Value must be at least " + min + ".");
          }
          if (!isNaN(max) && num > max) {
            errors.push("Value must be no more than " + max + ".");
          }
        }
      }

      // Password match
      var matchSelector = field.getAttribute("data-match");
      if (matchSelector) {
        var matchTarget = field.form
          ? field.form.querySelector(matchSelector)
          : document.querySelector(matchSelector);
        if (matchTarget && value !== matchTarget.value) {
          errors.push("Fields do not match.");
        }
      }
    }

    // Update UI
    showFieldFeedback(field, errors);
    return errors.length === 0;
  }

  /**
   * Validate every validatable field in a form. Returns true if all pass.
   */
  function validateForm(form) {
    var fields = form.querySelectorAll("input, textarea, select");
    var allValid = true;

    fields.forEach(function (field) {
      if (!validateField(field)) {
        allValid = false;
      }
    });

    return allValid;
  }

  // ─── 3. UI Feedback Helpers ────────────────────────────────────────────────

  /**
   * Apply / remove .is-invalid and .is-valid classes and show or hide
   * the associated .invalid-feedback / .valid-feedback element.
   */
  function showFieldFeedback(field, errors) {
    // Remove previous state
    field.classList.remove("is-invalid", "is-valid");

    var group = field.closest(".form-group");
    // Remove old feedback elements
    var existing = group
      ? group.querySelectorAll(".invalid-feedback, .valid-feedback")
      : [];
    existing.forEach(function (el) { el.remove(); });

    if (errors.length > 0) {
      field.classList.add("is-invalid");
      var msg = document.createElement("div");
      msg.className = "invalid-feedback";
      msg.textContent = errors[0];
      insertFeedbackElement(field, group, msg);
    } else if (field.value.trim()) {
      field.classList.add("is-valid");
      var successMsg = document.createElement("div");
      successMsg.className = "valid-feedback";
      successMsg.textContent = "Looks good!";
      insertFeedbackElement(field, group, successMsg);
    }
  }

  /**
   * Insert the feedback element directly after the field (or after the
   * input-group wrapper if one exists).
   */
  function insertFeedbackElement(field, group, element) {
    var container = field.closest(".input-group") || field;
    container.parentNode.insertBefore(element, container.nextSibling);
  }

  // ─── 4. Validation Helpers / Regex ─────────────────────────────────────────

  function isRequired(field) {
    return (
      field.hasAttribute("required") ||
      field.getAttribute("data-required") !== null
    );
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    // Accept digits, spaces, dashes, parens, leading +
    var digits = phone.replace(/[\s\-\(\)\+]/g, "");
    return /^\d{7,15}$/.test(digits);
  }

  function isValidURL(url) {
    try {
      var parsed = new URL(url);
      return /^https?:$/.test(parsed.protocol);
    } catch (_) {
      return false;
    }
  }

  // ─── 5. Phone Number Auto-Formatting ───────────────────────────────────────

  function initPhoneFormatting() {
    var phoneInputs = document.querySelectorAll(
      'input[data-type="phone"], input[type="tel"]'
    );

    phoneInputs.forEach(function (input) {
      input.addEventListener("input", function () {
        formatPhoneNumber(input);
      });
    });
  }

  /**
   * Auto-format phone number as the user types.
   * Supports US-style (xxx) xxx-xxxx and international +xx formats.
   */
  function formatPhoneNumber(input) {
    var raw = input.value.replace(/[^\d+]/g, "");

    // International number starting with + — just allow digits and +
    if (raw.charAt(0) === "+") {
      // Limit to 15 digits (E.164 max)
      var digits = raw.substring(1).replace(/\D/g, "").substring(0, 15);
      input.value = "+" + digits;
      return;
    }

    // US / Canada style: (xxx) xxx-xxxx
    var digits = raw.replace(/\D/g, "").substring(0, 10);
    if (digits.length === 0) {
      input.value = "";
      return;
    }

    if (digits.length <= 3) {
      input.value = "(" + digits;
    } else if (digits.length <= 6) {
      input.value = "(" + digits.substring(0, 3) + ") " + digits.substring(3);
    } else {
      input.value =
        "(" +
        digits.substring(0, 3) +
        ") " +
        digits.substring(3, 6) +
        "-" +
        digits.substring(6);
    }
  }

  // ─── 6. Contact Form ───────────────────────────────────────────────────────

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    form.setAttribute("novalidate", true);

    var successEl = form.querySelector(".form-success-msg");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validateForm(form)) {
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid.focus();
        }
        return;
      }

      // Simulate sending (replace with real AJAX in production)
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending...";
      }

      setTimeout(function () {
        form.reset();

        // Clear all validation classes
        form.querySelectorAll(".is-invalid, .is-valid").forEach(function (el) {
          el.classList.remove("is-invalid", "is-valid");
        });
        form.querySelectorAll(".invalid-feedback, .valid-feedback").forEach(
          function (el) { el.remove(); }
        );

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        }

        // Show success message
        if (successEl) {
          successEl.classList.add("visible");
          successEl.scrollIntoView({ behavior: "smooth", block: "center" });
          setTimeout(function () {
            successEl.classList.remove("visible");
          }, 5000);
        }

        showToast("Message sent successfully! We'll get back to you soon.", "success");
      }, 1200);
    });
  }

  // ─── 7. Newsletter Form ────────────────────────────────────────────────────

  function initNewsletterForm() {
    var forms = document.querySelectorAll(".newsletter-form");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var input = form.querySelector('input[type="email"]');
        if (!input) return;

        var value = input.value.trim();
        if (!value || !isValidEmail(value)) {
          input.classList.add("is-invalid");

          // Remove previous feedback
          var old = form.querySelector(".invalid-feedback");
          if (old) old.remove();

          var msg = document.createElement("div");
          msg.className = "invalid-feedback";
          msg.textContent = "Please enter a valid email address.";
          input.parentNode.insertBefore(msg, input.nextSibling);
          return;
        }

        // Clear error state
        input.classList.remove("is-invalid");
        var old = form.querySelector(".invalid-feedback");
        if (old) old.remove();

        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Subscribing...";
        }

        setTimeout(function () {
          form.reset();

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Subscribe";
          }

          showToast(
            "You've been subscribed to our newsletter!",
            "success"
          );
        }, 800);
      });
    });
  }

  // ─── 8. Login Form ─────────────────────────────────────────────────────────

  function initLoginForm() {
    var form = document.getElementById("login-form");
    if (!form) return;

    form.setAttribute("novalidate", true);

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validateForm(form)) {
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid.focus();
        }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Signing in...";
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Sign In";
        }

        showToast("Welcome back! Redirecting to your dashboard...", "success");

        // In production, redirect or handle session here
        // window.location.href = '/dashboard';
      }, 1500);
    });
  }

  // ─── 9. Registration Form & Password Strength ──────────────────────────────

  function initRegistrationForm() {
    var form = document.getElementById("register-form");
    if (!form) return;

    form.setAttribute("novalidate", true);

    var passwordInput = form.querySelector('input[name="password"]');
    var confirmInput = form.querySelector('input[name="confirm-password"]');

    // Set up password strength indicator if password field exists
    if (passwordInput) {
      setupPasswordStrength(passwordInput);
    }

    // Re-validate confirm-password when password changes
    if (passwordInput && confirmInput) {
      passwordInput.addEventListener("input", function () {
        if (confirmInput.value.trim()) {
          validateField(confirmInput);
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!validateForm(form)) {
        var firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
          firstInvalid.focus();
        }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Create Account";
        }

        showToast("Account created successfully! Welcome aboard.", "success");
      }, 1500);
    });
  }

  // ─── 10. Password Strength Indicator ───────────────────────────────────────

  /**
   * Create or wire up a four-bar strength meter below the given password
   * field and update it on every keystroke.
   */
  function setupPasswordStrength(passwordInput) {
    var group = passwordInput.closest(".form-group");
    if (!group) return;

    // Build the strength UI if it doesn't exist yet
    var meter = group.querySelector(".password-strength");
    var label = group.querySelector(".password-strength-label");

    if (!meter) {
      meter = document.createElement("div");
      meter.className = "password-strength";
      meter.setAttribute("data-level", "0");
      meter.innerHTML =
        '<div class="bar"></div>' +
        '<div class="bar"></div>' +
        '<div class="bar"></div>' +
        '<div class="bar"></div>';
      passwordInput.parentNode.insertBefore(
        meter,
        passwordInput.nextSibling
      );
    }

    if (!label) {
      label = document.createElement("div");
      label.className = "password-strength-label";
      meter.parentNode.insertBefore(label, meter.nextSibling);
    }

    passwordInput.addEventListener("input", function () {
      var score = calculatePasswordStrength(passwordInput.value);
      meter.setAttribute("data-level", String(score.level));
      label.textContent = score.label;
    });
  }

  /**
   * Score password strength from 0 (empty) to 4 (very strong).
   */
  function calculatePasswordStrength(password) {
    if (!password) return { level: 0, label: "" };

    var score = 0;

    // Length-based
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity — check for at least three of four categories
    var categories = 0;
    if (/[a-z]/.test(password)) categories++;
    if (/[A-Z]/.test(password)) categories++;
    if (/\d/.test(password)) categories++;
    if (/[^a-zA-Z0-9]/.test(password)) categories++;

    if (categories >= 3) score++;
    if (categories >= 4) score++;

    // Cap at 4
    score = Math.min(score, 4);

    var labels = ["", "Weak", "Fair", "Strong", "Very strong"];
    return { level: score, label: labels[score] };
  }

  // ─── 11. Password Visibility Toggles ───────────────────────────────────────

  function initPasswordToggles() {
    var toggles = document.querySelectorAll(
      ".password-toggle, [data-toggle-password]"
    );

    toggles.forEach(function (toggle) {
      var targetSelector =
        toggle.getAttribute("data-toggle-password") ||
        toggle.getAttribute("data-target");
      var target = targetSelector
        ? document.querySelector(targetSelector)
        : toggle.closest(".form-group").querySelector('input[type="password"], input[type="text"]');

      if (!target) return;

      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        var isPassword = target.type === "password";
        target.type = isPassword ? "text" : "password";

        // Toggle icon if the button contains an <i> element
        var icon = toggle.querySelector("i");
        if (icon) {
          icon.classList.toggle("ri-eye-off-line", isPassword);
          icon.classList.toggle("ri-eye-line", !isPassword);
          icon.classList.toggle("fa-eye", !isPassword);
          icon.classList.toggle("fa-eye-slash", isPassword);
        }
        toggle.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
      });
    });
  }

  // ─── 12. Toast Notification Helper ─────────────────────────────────────────

  /**
   * Show a brief toast message at the top-right of the viewport.
   * Reuses the .toast markup from the project CSS if a .toast-container
   * exists; otherwise creates one on the fly.
   */
  function showToast(message, type) {
    type = type || "success";

    var container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    var icons = {
      success: "ri-check-line",
      error: "ri-error-warning-line",
      warning: "ri-alert-line"
    };

    var toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerHTML =
      '<i class="' + (icons[type] || icons.success) + '"></i>' +
      '<div class="toast-content"><p>' + message + "</p></div>";

    container.appendChild(toast);

    // Trigger reflow then animate in
    toast.offsetHeight;
    toast.classList.add("show");

    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 4000);
  }
})();
