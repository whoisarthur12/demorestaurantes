(function () {
  "use strict";

  var WHATSAPP_NUMBER = "529841305577";

  var WHATSAPP_MESSAGES = {
    book: { es: "Hola DUNA, quisiera reservar una mesa.", en: "Hi DUNA, I'd like to book a table." },
    gift: { es: "Hola, quisiera información sobre tarjetas de regalo.", en: "Hi, I'd like info about gift cards." },
    events: { es: "Hola, quisiera cotizar un evento privado.", en: "Hi, I'd like a quote for a private event." }
  };

  var DISH_MESSAGE = {
    es: function (name) { return "Hola DUNA, quisiera pedir: " + name + "."; },
    en: function (name) { return "Hi DUNA, I'd like to order: " + name + "."; }
  };

  var currentLang = localStorage.getItem("duna-lang") === "en" ? "en" : "es";

  function buildWaLink(kind, el) {
    var msg;
    if (kind === "dish" && el) {
      msg = DISH_MESSAGE[currentLang](el.getAttribute("data-dish-name") || "");
    } else {
      msg = WHATSAPP_MESSAGES[kind] ? WHATSAPP_MESSAGES[kind][currentLang] : WHATSAPP_MESSAGES.book[currentLang];
    }
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function refreshWaLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
      el.setAttribute("href", buildWaLink(el.getAttribute("data-whatsapp"), el));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-es][data-en]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });
    localStorage.setItem("duna-lang", lang);
    refreshWaLinks();
  }

  var langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-lang-btn]");
      if (!btn) return;
      applyLang(btn.getAttribute("data-lang-btn"));
    });
  }

  var menuToggle = document.getElementById("menuToggle");
  var navOverlay = document.getElementById("navOverlay");
  var navClose = document.getElementById("navClose");

  function openNav() {
    navOverlay.classList.add("is-open");
    document.body.classList.add("nav-locked");
    menuToggle.setAttribute("aria-expanded", "true");
  }

  function closeNav() {
    navOverlay.classList.remove("is-open");
    document.body.classList.remove("nav-locked");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && navOverlay) {
    menuToggle.addEventListener("click", function () {
      navOverlay.classList.contains("is-open") ? closeNav() : openNav();
    });
    navClose.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
    navOverlay.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
  }

  // ===== Menu page: category tabs =====
  var menuTabs = document.querySelectorAll(".menu-tab");
  if (menuTabs.length) {
    var dishCards = document.querySelectorAll(".dish-card");
    menuTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        menuTabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var cat = tab.getAttribute("data-tab");
        dishCards.forEach(function (card) {
          var show = cat === "all" || card.getAttribute("data-category") === cat;
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  // ===== Scroll-driven UI: header state, progress bars, daybar contrast =====
  var header = document.getElementById("siteHeader");
  var dayBar = document.getElementById("dayBar");
  var dayFill = document.getElementById("dayFill");
  var scrollProgressFill = document.getElementById("scrollProgressFill");

  function updateDaybarContrast() {
    if (!dayBar) return;
    var x = window.innerWidth - 40;
    var y = window.innerHeight / 2;
    var el = document.elementFromPoint(x, y);
    var themed = el && el.closest("[data-daybar-theme]");
    var theme = themed ? themed.getAttribute("data-daybar-theme") : "light";
    dayBar.classList.toggle("is-dark", theme === "dark");
  }

  var ticking = false;

  function updateOnScroll() {
    ticking = false;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var pct = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;

    if (header) header.classList.toggle("scrolled", scrollTop > 40);
    if (dayFill) dayFill.style.height = (pct * 100) + "%";
    if (scrollProgressFill) scrollProgressFill.style.width = (pct * 100) + "%";
    updateDaybarContrast();
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  var whatsappFloat = document.getElementById("whatsappFloat");
  if (whatsappFloat) whatsappFloat.classList.add("visible");

  // ===== Reveal on scroll + animated counters =====
  var prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { observer.observe(el); });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-count-to]");
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseInt(el.getAttribute("data-count-to"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion) {
        el.textContent = target + suffix;
        return;
      }
      var duration = 1200;
      var start = null;
      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  initReveal();
  initCounters();

  applyLang(currentLang);
  updateOnScroll();
})();
