// Experiment 3: Plain JavaScript DOM Manipulation (data-* hooks only)
(function initDomLab() {
  const root = document.querySelector(".exp3");
  if (!root) return;

  const cleanups = [];

  // 1. Live Clock & Time-Based Greeting (setInterval + textContent)
  const clockEl = root.querySelector("[data-clock]");
  const greetingEl = root.querySelector("[data-greeting]");

  function updateClock() {
    const now = new Date();
    const hour = now.getHours();
    let greet = "Good evening";
    if (hour < 12) greet = "Good morning";
    else if (hour < 18) greet = "Good afternoon";

    if (greetingEl) greetingEl.textContent = `${greet}, Ashwarya (23BCON1659)`;
    if (clockEl) clockEl.textContent = now.toLocaleTimeString();
  }
  updateClock();
  const clockTimer = setInterval(updateClock, 1000);
  cleanups.push(() => clearInterval(clockTimer));

  // 2. Light / Dark Theme Toggle (setAttribute on wrapper)
  const themeBtn = root.querySelector("[data-theme-toggle]");
  themeBtn?.addEventListener("click", () => {
    const isDark = root.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    root.setAttribute("data-theme", next);
    themeBtn.setAttribute("aria-pressed", String(!isDark));
    themeBtn.textContent = next === "dark" ? "☀️ Switch to light" : "🌙 Switch to dark";
  });

  // Toast helper (createElement + appendChild + setTimeout)
  const toastRegion = root.querySelector("[data-toast-region]");
  const toastBtn = root.querySelector("[data-toast-trigger]");
  function showToast(msg) {
    if (!toastRegion) return;
    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.textContent = msg;
    toastRegion.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  toastBtn?.addEventListener("click", () => {
    showToast("DOM Event Fired — Ashwarya Agrawal (23BCON1659)");
  });

  // 3 & 4. Project Filter (Event Delegation) + Live Search + Sort
  const filterGroup = root.querySelector("[data-filter-group]");
  const searchInput = root.querySelector("[data-search-input]");
  const sortSelect = root.querySelector("[data-sort-select]");
  const projectList = root.querySelector("[data-project-list]");
  const visibleCountEl = root.querySelector("[data-visible-count]");
  const emptyStateEl = root.querySelector("[data-empty-state]");
  let activeCategory = "all";

  function applyProjectQuery() {
    if (!projectList) return;
    const cards = Array.from(projectList.querySelectorAll(".proj-item"));
    const query = (searchInput?.value || "").trim().toLowerCase();
    const sortBy = sortSelect?.value || "newest";

    cards.sort((a, b) => {
      if (sortBy === "az") {
        return (a.dataset.title || "").localeCompare(b.dataset.title || "");
      }
      const yearA = Number(a.dataset.year || 0);
      const yearB = Number(b.dataset.year || 0);
      return sortBy === "oldest" ? yearA - yearB : yearB - yearA;
    });

    let visible = 0;
    cards.forEach((card) => {
      projectList.appendChild(card);
      const matchesCat = activeCategory === "all" || card.dataset.category === activeCategory;
      const matchesText = !query || card.textContent.toLowerCase().includes(query);
      const show = matchesCat && matchesText;
      card.style.display = show ? "" : "none";
      if (show) visible += 1;
    });

    if (visibleCountEl) visibleCountEl.textContent = String(visible);
    if (emptyStateEl) emptyStateEl.hidden = visible > 0;
  }

  filterGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    activeCategory = btn.dataset.filter || "all";
    filterGroup.querySelectorAll("[data-filter]").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });
    applyProjectQuery();
  });

  searchInput?.addEventListener("input", applyProjectQuery);
  sortSelect?.addEventListener("change", applyProjectQuery);

  // 5. Click Counter
  let count = 0;
  const countVal = root.querySelector("[data-counter-value]");
  function renderCount() {
    if (countVal) countVal.textContent = String(count);
  }
  root.querySelector("[data-counter-inc]")?.addEventListener("click", () => {
    count += 1;
    renderCount();
  });
  root.querySelector("[data-counter-dec]")?.addEventListener("click", () => {
    count -= 1;
    renderCount();
  });
  root.querySelector("[data-counter-reset]")?.addEventListener("click", () => {
    count = 0;
    renderCount();
  });

  // 6. Progress Bar Animated with requestAnimationFrame
  const progressBar = root.querySelector("[data-progress-bar]");
  const progressFill = root.querySelector("[data-progress-fill]");
  const progressLabel = root.querySelector("[data-progress-label]");
  let rafId = null;

  function setProgress(pct) {
    const rounded = Math.round(pct);
    if (progressFill) progressFill.style.width = `${rounded}%`;
    if (progressLabel) progressLabel.textContent = `${rounded}%`;
    progressBar?.setAttribute("aria-valuenow", String(rounded));
  }

  root.querySelector("[data-progress-run]")?.addEventListener("click", () => {
    if (rafId) cancelAnimationFrame(rafId);
    const start = performance.now();
    const duration = 900;
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 100);
      if (t < 1) rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
  });

  root.querySelector("[data-progress-reset]")?.addEventListener("click", () => {
    if (rafId) cancelAnimationFrame(rafId);
    setProgress(0);
  });

  // 7. Accessible Modal (Open/Close, Escape Key, Focus Return)
  const modalBackdrop = root.querySelector("[data-modal-backdrop]");
  const modalHeading = root.querySelector("[data-modal-heading]");
  const modalContent = root.querySelector("[data-modal-content]");
  let lastFocused = null;

  function closeModal() {
    if (!modalBackdrop || modalBackdrop.hidden) return;
    modalBackdrop.hidden = true;
    document.body.style.overflow = "";
    lastFocused?.focus();
  }

  root.querySelector("[data-modal-triggers]")?.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-modal-open]");
    if (!trigger || !modalBackdrop) return;
    lastFocused = trigger;
    if (modalHeading) modalHeading.textContent = trigger.dataset.modalTitle || "Details";
    if (modalContent) modalContent.textContent = trigger.dataset.modalBody || "";
    modalBackdrop.hidden = false;
    document.body.style.overflow = "hidden";
    modalBackdrop.querySelector("[data-modal-close]")?.focus();
  });

  modalBackdrop?.addEventListener("click", (e) => {
    if (e.target === modalBackdrop || e.target.closest("[data-modal-close]")) {
      closeModal();
    }
  });

  function onKeyDown(e) {
    if (e.key === "Escape") closeModal();
  }
  document.addEventListener("keydown", onKeyDown);
  cleanups.push(() => document.removeEventListener("keydown", onKeyDown));

  // 8. Accordion with aria-expanded (Event Delegation)
  root.querySelector("[data-accordion]")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".acc-trigger");
    if (!btn) return;
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    const panel = btn.nextElementSibling;
    if (panel) panel.hidden = expanded;
  });

  // 9. Newsletter Form with Inline Validation
  const nlForm = root.querySelector("[data-newsletter-form]");
  const nlName = root.querySelector("[data-nl-name]");
  const nlEmail = root.querySelector("[data-nl-email]");
  const nlNameErr = root.querySelector("[data-nl-name-err]");
  const nlEmailErr = root.querySelector("[data-nl-email-err]");
  const nlStatus = root.querySelector("[data-nl-status]");

  nlForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameVal = (nlName?.value || "").trim();
    const emailVal = (nlEmail?.value || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

    if (nlNameErr) nlNameErr.textContent = nameVal.length < 2 ? "Please enter at least 2 characters." : "";
    if (nlEmailErr) nlEmailErr.textContent = !emailOk ? "Please enter a valid email address." : "";

    if (nameVal.length < 2 || !emailOk) {
      if (nlStatus) nlStatus.textContent = "";
      return;
    }

    if (nlStatus) {
      nlStatus.textContent = `Subscribed ${nameVal}! Logged under Ashwarya Agrawal (23BCON1659).`;
    }
    nlForm.reset();
  });

  // 10. Scroll Reveal using IntersectionObserver
  const revealItems = root.querySelectorAll(".reveal-item");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealItems.forEach((el) => observer.observe(el));
    cleanups.push(() => observer.disconnect());
  } else {
    revealItems.forEach((el) => el.classList.add("is-revealed"));
  }

  window.addEventListener("beforeunload", () => {
    cleanups.forEach((fn) => fn());
  });
})();
