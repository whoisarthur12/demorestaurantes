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
    refreshBookingLang();
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

  // ===== Booking wizard =====
  var bookingModal = document.getElementById("bookingModal");
  var bookingState = { date: null, time: null, guests: 2, name: "", phone: "" };
  var bookingStepIndex = 0;
  var bookingStepOrder = ["date", "time", "guests", "contact", "summary"];
  var bookingCalendarView = null;
  var bookingContactAttempted = false;
  var bookingProgressPathLength = null;

  var GUESTS_MIN = 1;
  var GUESTS_MAX = 12;
  var CAL_MONTHS_AHEAD = 3;

  var BOOKING_WEEKDAYS = {
    es: ["L", "M", "M", "J", "V", "S", "D"],
    en: ["M", "T", "W", "T", "F", "S", "S"]
  };

  var BOOKING_LABELS = {
    es: { intro: "Hola DUNA, quiero reservar una mesa:", date: "Fecha", time: "Hora", guests: "Personas", name: "Nombre", phone: "Teléfono" },
    en: { intro: "Hi DUNA, I'd like to book a table:", date: "Date", time: "Time", guests: "Guests", name: "Name", phone: "Phone" }
  };

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function buildTimeSlots(startH, startM, endH, endM) {
    var slots = [];
    var h = startH, m = startM;
    while (h < endH || (h === endH && m <= endM)) {
      slots.push(pad2(h) + ":" + pad2(m));
      m += 30;
      if (m >= 60) { m -= 60; h += 1; }
    }
    return slots;
  }

  var LUNCH_SLOTS = buildTimeSlots(13, 0, 16, 30);
  var DINNER_SLOTS = buildTimeSlots(18, 0, 22, 30);

  function todayAtMidnight() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function isSameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function capitalizeFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function setBilingualText(el, es, en) {
    el.setAttribute("data-es", es);
    el.setAttribute("data-en", en);
    el.textContent = currentLang === "es" ? es : en;
  }

  function shakeEl(el) {
    if (!el || prefersReducedMotion) return;
    el.classList.remove("is-shaking");
    void el.offsetWidth;
    el.classList.add("is-shaking");
    window.setTimeout(function () { el.classList.remove("is-shaking"); }, 500);
  }

  function refreshBookingLang() {
    if (!bookingModal || !bookingModal.classList.contains("is-open")) return;
    bookingRenderCalendar();
    bookingRenderTimeChips();
    bookingUpdateNextButton();
    if (bookingStepOrder[bookingStepIndex] === "summary") bookingRenderSummary();
  }

  var bookingCalMonth, bookingCalWeekdays, bookingCalDays, bookingCalPrev, bookingCalNext;
  var bookingChipsLunch, bookingChipsDinner;
  var bookingGuestsValue, bookingGuestsMinus, bookingGuestsPlus, bookingStepperEl;
  var bookingNameInput, bookingPhoneInput;
  var bookingBackBtn, bookingNextBtn, bookingProgressFill, bookingProgressDots, bookingStepsEls;
  var bookingBackdrop, bookingCloseBtn;

  function bookingRenderCalendar() {
    if (!bookingCalendarView) {
      var t = todayAtMidnight();
      bookingCalendarView = new Date(t.getFullYear(), t.getMonth(), 1);
    }
    var monthFormatter = new Intl.DateTimeFormat(currentLang === "es" ? "es-MX" : "en-US", { month: "long", year: "numeric" });
    bookingCalMonth.textContent = capitalizeFirst(monthFormatter.format(bookingCalendarView));

    bookingCalWeekdays.innerHTML = "";
    BOOKING_WEEKDAYS[currentLang].forEach(function (wd) {
      var span = document.createElement("span");
      span.textContent = wd;
      bookingCalWeekdays.appendChild(span);
    });

    bookingCalDays.innerHTML = "";
    var year = bookingCalendarView.getFullYear();
    var month = bookingCalendarView.getMonth();
    var firstOfMonth = new Date(year, month, 1);
    var startOffset = (firstOfMonth.getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = todayAtMidnight();

    for (var i = 0; i < startOffset; i++) {
      var empty = document.createElement("span");
      empty.className = "booking-cal-day is-empty";
      bookingCalDays.appendChild(empty);
    }

    var _loop = function (day) {
      var dateObj = new Date(year, month, day);
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "booking-cal-day";
      btn.textContent = day;
      if (dateObj < today) {
        btn.classList.add("is-disabled");
        btn.disabled = true;
      } else {
        btn.addEventListener("click", function () {
          bookingState.date = dateObj;
          bookingRenderCalendar();
          bookingUpdateNextButton();
        });
      }
      if (isSameDay(dateObj, today)) btn.classList.add("is-today");
      if (bookingState.date && isSameDay(dateObj, bookingState.date)) btn.classList.add("is-selected");
      bookingCalDays.appendChild(btn);
    };
    for (var day = 1; day <= daysInMonth; day++) _loop(day);

    var isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    bookingCalPrev.disabled = isCurrentMonth;
    var maxDate = new Date(today.getFullYear(), today.getMonth() + CAL_MONTHS_AHEAD, 1);
    bookingCalNext.disabled = (year === maxDate.getFullYear() && month === maxDate.getMonth());
  }

  function bookingRenderTimeChips() {
    [[bookingChipsLunch, LUNCH_SLOTS], [bookingChipsDinner, DINNER_SLOTS]].forEach(function (pair) {
      var container = pair[0], slots = pair[1];
      container.innerHTML = "";
      slots.forEach(function (slot) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "booking-time-chip";
        chip.textContent = slot;
        if (bookingState.time === slot) chip.classList.add("is-selected");
        chip.addEventListener("click", function () {
          bookingState.time = slot;
          bookingRenderTimeChips();
          bookingUpdateNextButton();
        });
        container.appendChild(chip);
      });
    });
  }

  function bookingRenderGuests() {
    bookingGuestsValue.textContent = bookingState.guests;
    bookingGuestsMinus.classList.toggle("is-at-limit", bookingState.guests <= GUESTS_MIN);
    bookingGuestsPlus.classList.toggle("is-at-limit", bookingState.guests >= GUESTS_MAX);
  }

  function isBookingNameValid() { return bookingNameInput.value.trim().length >= 2; }
  function isBookingPhoneValid() { return bookingPhoneInput.value.replace(/\D/g, "").length >= 8; }

  function bookingUpdateFieldState(input, valid) {
    var field = input.closest(".booking-field");
    input.classList.toggle("is-valid", valid);
    field.classList.toggle("has-error", bookingContactAttempted && !valid);
  }

  function bookingValidateContact() {
    bookingUpdateFieldState(bookingNameInput, isBookingNameValid());
    bookingUpdateFieldState(bookingPhoneInput, isBookingPhoneValid());
  }

  function bookingRenderSummary() {
    var dateFormatter = new Intl.DateTimeFormat(currentLang === "es" ? "es-MX" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    document.getElementById("bookingSummaryDate").textContent = bookingState.date ? capitalizeFirst(dateFormatter.format(bookingState.date)) : "—";
    document.getElementById("bookingSummaryTime").textContent = bookingState.time || "—";
    document.getElementById("bookingSummaryGuests").textContent = bookingState.guests;
    document.getElementById("bookingSummaryName").textContent = bookingState.name || "—";
    document.getElementById("bookingSummaryPhone").textContent = bookingState.phone || "—";
  }

  function isBookingStepValid(stepName) {
    if (stepName === "date") return !!bookingState.date;
    if (stepName === "time") return !!bookingState.time;
    if (stepName === "contact") return isBookingNameValid() && isBookingPhoneValid();
    return true;
  }

  function bookingUpdateNextButton() {
    var stepName = bookingStepOrder[bookingStepIndex];
    var valid = isBookingStepValid(stepName);
    bookingNextBtn.classList.toggle("is-disabled", !valid);
    var isLast = bookingStepIndex === bookingStepOrder.length - 1;
    var span = bookingNextBtn.querySelector("span");
    if (isLast) {
      setBilingualText(span, "Confirmar reserva por WhatsApp", "Confirm reservation via WhatsApp");
    } else {
      setBilingualText(span, "Siguiente", "Next");
    }
    bookingBackBtn.classList.toggle("is-invisible", bookingStepIndex === 0);
  }

  function bookingUpdateProgress() {
    if (bookingProgressFill) {
      if (bookingProgressPathLength === null) {
        bookingProgressPathLength = bookingProgressFill.getTotalLength();
        bookingProgressFill.style.strokeDasharray = bookingProgressPathLength;
      }
      var fraction = bookingStepIndex / (bookingStepOrder.length - 1);
      bookingProgressFill.style.strokeDashoffset = bookingProgressPathLength * (1 - fraction);
    }
    bookingProgressDots.forEach(function (dot, i) {
      dot.classList.toggle("is-done", i < bookingStepIndex);
      dot.classList.toggle("is-current", i === bookingStepIndex);
    });
  }

  function bookingShowStep(direction) {
    bookingStepsEls.forEach(function (stepEl, i) {
      stepEl.classList.remove("dir-fwd", "dir-back", "is-active");
      if (i === bookingStepIndex) {
        stepEl.classList.add("is-active");
        void stepEl.offsetWidth;
        stepEl.classList.add(direction === 1 ? "dir-fwd" : "dir-back");
      }
    });
    bookingUpdateProgress();
    if (bookingStepOrder[bookingStepIndex] === "summary") bookingRenderSummary();
    bookingUpdateNextButton();
  }

  function buildBookingMessage() {
    var labels = BOOKING_LABELS[currentLang];
    var dateFormatter = new Intl.DateTimeFormat(currentLang === "es" ? "es-MX" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    var dateLabel = bookingState.date ? capitalizeFirst(dateFormatter.format(bookingState.date)) : "";
    return labels.intro + "\n" +
      labels.date + ": " + dateLabel + "\n" +
      labels.time + ": " + bookingState.time + "\n" +
      labels.guests + ": " + bookingState.guests + "\n" +
      labels.name + ": " + bookingState.name + "\n" +
      labels.phone + ": " + bookingState.phone;
  }

  function bookingConfirm() {
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(buildBookingMessage());
    window.open(url, "_blank", "noopener");
    closeBooking();
  }

  function bookingGoNext() {
    var stepName = bookingStepOrder[bookingStepIndex];
    if (stepName === "contact") {
      bookingContactAttempted = true;
      bookingValidateContact();
    }
    if (!isBookingStepValid(stepName)) {
      shakeEl(bookingNextBtn);
      return;
    }
    if (bookingStepIndex === bookingStepOrder.length - 1) {
      bookingConfirm();
      return;
    }
    bookingStepIndex++;
    bookingShowStep(1);
  }

  function bookingGoBack() {
    if (bookingStepIndex === 0) return;
    bookingStepIndex--;
    bookingShowStep(-1);
  }

  function resetBookingState() {
    bookingState = { date: null, time: null, guests: 2, name: "", phone: "" };
    bookingStepIndex = 0;
    bookingContactAttempted = false;
    bookingCalendarView = null;
    bookingNameInput.value = "";
    bookingPhoneInput.value = "";
    [bookingNameInput, bookingPhoneInput].forEach(function (input) {
      input.classList.remove("is-valid");
      input.closest(".booking-field").classList.remove("has-error");
    });
  }

  function openBooking() {
    resetBookingState();
    bookingRenderCalendar();
    bookingRenderTimeChips();
    bookingRenderGuests();
    bookingModal.setAttribute("aria-hidden", "false");
    bookingModal.classList.add("is-open");
    document.body.classList.add("booking-locked");
    bookingShowStep(1);
  }

  function closeBooking() {
    bookingModal.classList.remove("is-open");
    bookingModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("booking-locked");
  }

  if (bookingModal) {
    bookingCalMonth = document.getElementById("bookingCalMonth");
    bookingCalWeekdays = document.getElementById("bookingCalWeekdays");
    bookingCalDays = document.getElementById("bookingCalDays");
    bookingCalPrev = document.getElementById("bookingCalPrev");
    bookingCalNext = document.getElementById("bookingCalNext");
    bookingChipsLunch = document.getElementById("bookingTimeChipsLunch");
    bookingChipsDinner = document.getElementById("bookingTimeChipsDinner");
    bookingGuestsValue = document.getElementById("bookingGuestsValue");
    bookingGuestsMinus = document.getElementById("bookingGuestsMinus");
    bookingGuestsPlus = document.getElementById("bookingGuestsPlus");
    bookingStepperEl = document.getElementById("bookingStepper");
    bookingNameInput = document.getElementById("bookingName");
    bookingPhoneInput = document.getElementById("bookingPhone");
    bookingBackBtn = document.getElementById("bookingBack");
    bookingNextBtn = document.getElementById("bookingNext");
    bookingProgressFill = document.getElementById("bookingProgressFill");
    bookingProgressDots = bookingModal.querySelectorAll(".booking-progress-dot");
    bookingStepsEls = bookingModal.querySelectorAll(".booking-step");
    bookingBackdrop = document.getElementById("bookingBackdrop");
    bookingCloseBtn = document.getElementById("bookingClose");

    bookingCalPrev.addEventListener("click", function () {
      bookingCalendarView = new Date(bookingCalendarView.getFullYear(), bookingCalendarView.getMonth() - 1, 1);
      bookingRenderCalendar();
    });
    bookingCalNext.addEventListener("click", function () {
      bookingCalendarView = new Date(bookingCalendarView.getFullYear(), bookingCalendarView.getMonth() + 1, 1);
      bookingRenderCalendar();
    });
    bookingGuestsMinus.addEventListener("click", function () {
      if (bookingState.guests > GUESTS_MIN) {
        bookingState.guests--;
        bookingRenderGuests();
      } else {
        shakeEl(bookingStepperEl);
      }
    });
    bookingGuestsPlus.addEventListener("click", function () {
      if (bookingState.guests < GUESTS_MAX) {
        bookingState.guests++;
        bookingRenderGuests();
      } else {
        shakeEl(bookingStepperEl);
      }
    });
    bookingNameInput.addEventListener("input", function () {
      bookingState.name = bookingNameInput.value.trim();
      bookingValidateContact();
      bookingUpdateNextButton();
    });
    bookingPhoneInput.addEventListener("input", function () {
      bookingState.phone = bookingPhoneInput.value.trim();
      bookingValidateContact();
      bookingUpdateNextButton();
    });
    bookingNextBtn.addEventListener("click", bookingGoNext);
    bookingBackBtn.addEventListener("click", bookingGoBack);
    bookingCloseBtn.addEventListener("click", closeBooking);
    bookingBackdrop.addEventListener("click", closeBooking);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && bookingModal.classList.contains("is-open")) closeBooking();
    });
    document.querySelectorAll("[data-booking-trigger]").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        closeNav();
        openBooking();
      });
    });
  }

  initReveal();
  initCounters();

  applyLang(currentLang);
  updateOnScroll();
})();
