(function () {
  "use strict";

  var WHATSAPP_NUMBER = "529841305577";

  var WHATSAPP_MESSAGES = {
    book: { es: "Hola DUNA, quisiera reservar una mesa.", en: "Hi DUNA, I'd like to book a table." },
    gift: { es: "Hola, quisiera información sobre tarjetas de regalo.", en: "Hi, I'd like info about gift cards." },
    events: { es: "Hola, quisiera cotizar un evento privado.", en: "Hi, I'd like a quote for a private event." }
  };

  var currentLang = localStorage.getItem("duna-lang") === "en" ? "en" : "es";

  function buildWaLink(kind) {
    var msg = WHATSAPP_MESSAGES[kind] ? WHATSAPP_MESSAGES[kind][currentLang] : WHATSAPP_MESSAGES.book[currentLang];
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function refreshWaLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
      el.setAttribute("href", buildWaLink(el.getAttribute("data-whatsapp")));
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

  var header = document.getElementById("siteHeader");
  var dayMarker = document.getElementById("dayMarker");
  var dayLabel = document.getElementById("dayLabel");
  var whatsappFloat = document.getElementById("whatsappFloat");
  var scrollProgressFill = document.getElementById("scrollProgressFill");

  var DAY_STATES = [
    { max: 0.22, es: "mañana", en: "morning" },
    { max: 0.5, es: "tarde", en: "afternoon" },
    { max: 0.78, es: "atardecer", en: "evening" },
    { max: 1, es: "noche", en: "night" }
  ];

  var ticking = false;

  function updateOnScroll() {
    ticking = false;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var pct = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;

    if (header) header.classList.toggle("scrolled", scrollTop > 40);
    if (whatsappFloat) whatsappFloat.classList.toggle("visible", scrollTop > window.innerHeight * 0.6);

    if (dayMarker) dayMarker.style.top = (pct * 100) + "%";

    if (dayLabel) {
      var state = DAY_STATES[DAY_STATES.length - 1];
      for (var i = 0; i < DAY_STATES.length; i++) {
        if (pct <= DAY_STATES[i].max) { state = DAY_STATES[i]; break; }
      }
      if (dayLabel.getAttribute("data-es") !== state.es) {
        dayLabel.setAttribute("data-es", state.es);
        dayLabel.setAttribute("data-en", state.en);
        dayLabel.textContent = state[currentLang];
      }
    }

    if (scrollProgressFill) scrollProgressFill.style.width = (pct * 100) + "%";
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  applyLang(currentLang);
  updateOnScroll();
})();
