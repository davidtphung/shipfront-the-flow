(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var navShell = document.querySelector("[data-nav-shell]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  var drawerLinks = drawer ? drawer.querySelectorAll("a, button") : [];
  var lastFocus = null;

  function setCompact() {
    if (!navShell) return;
    navShell.classList.toggle("is-compact", window.scrollY > 12);
  }

  function focusables(root) {
    return Array.prototype.slice.call(
      root.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  var toggleLabel = toggle ? toggle.querySelector(".visually-hidden") : null;

  function setToggleLabel(open) {
    if (toggleLabel) toggleLabel.textContent = open ? "Close Menu" : "Open Menu";
  }

  function openNav() {
    if (!drawer || !toggle) return;
    lastFocus = document.activeElement;
    document.documentElement.classList.add("is-nav-open");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    setToggleLabel(true);
    var items = focusables(drawer);
    if (items[0]) items[0].focus();
  }

  function closeNav() {
    if (!drawer || !toggle) return;
    document.documentElement.classList.remove("is-nav-open");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    setToggleLabel(false);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      if (document.documentElement.classList.contains("is-nav-open")) closeNav();
      else openNav();
    });

    drawer.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNav();
        return;
      }
      if (event.key !== "Tab") return;
      var items = focusables(drawer);
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    Array.prototype.forEach.call(drawer.querySelectorAll("[data-close-nav]"), function (el) {
      el.addEventListener("click", closeNav);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && document.documentElement.classList.contains("is-nav-open")) {
      closeNav();
    }
  });

  setCompact();
  window.addEventListener("scroll", setCompact, { passive: true });

  var rail = document.querySelector("[data-rail]");
  if (rail) {
    if (reduce.matches) {
      rail.classList.add("is-paused");
    } else if ("IntersectionObserver" in window) {
      var railWatch = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            rail.classList.toggle("is-paused", !entry.isIntersecting);
          });
        },
        { threshold: 0.05 }
      );
      railWatch.observe(rail);
    }
  }

  var dock = document.querySelector("[data-hero-dock]");
  if (dock && "IntersectionObserver" in window) {
    var dockWatch = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          dock.classList.toggle("is-offscreen", !entry.isIntersecting);
        });
      },
      { threshold: 0.12 }
    );
    dockWatch.observe(dock);
  }

  var board = document.querySelector("[data-journey-board]");
  var steps = document.querySelectorAll("[data-journey-step]");
  function setStep(name) {
    if (!board || !name) return;
    board.setAttribute("data-step", name);
    Array.prototype.forEach.call(steps, function (step) {
      var on = step.getAttribute("data-journey-step") === name;
      step.classList.toggle("is-active", on);
    });
  }

  if (board && steps.length) {
    Array.prototype.forEach.call(steps, function (step) {
      var btn = step.querySelector("button");
      if (!btn) return;
      btn.addEventListener("click", function () {
        setStep(step.getAttribute("data-journey-step"));
      });
      btn.addEventListener("focus", function () {
        setStep(step.getAttribute("data-journey-step"));
      });
    });

    if ("IntersectionObserver" in window && window.matchMedia("(min-width: 980px)").matches) {
      var stepWatch = new IntersectionObserver(
        function (entries) {
          var visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            })[0];
          if (visible) setStep(visible.target.getAttribute("data-journey-step"));
        },
        { rootMargin: "-30% 0px -45% 0px", threshold: [0.25, 0.5, 0.75] }
      );
      Array.prototype.forEach.call(steps, function (step) {
        stepWatch.observe(step);
      });
    }
  }

  var opsNodes = document.querySelectorAll("[data-ops-node]");
  Array.prototype.forEach.call(opsNodes, function (node, index) {
    node.addEventListener("click", function () {
      Array.prototype.forEach.call(opsNodes, function (other) {
        other.setAttribute("aria-pressed", other === node ? "true" : "false");
      });
    });
    node.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      var next = event.key === "ArrowRight" ? index + 1 : index - 1;
      if (next < 0) next = opsNodes.length - 1;
      if (next >= opsNodes.length) next = 0;
      opsNodes[next].focus();
      opsNodes[next].click();
    });
  });

  var form = document.querySelector("[data-quote-form]");
  if (form) {
    var success = document.querySelector("[data-quote-success]");
    var error = form.querySelector("[data-form-error]");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var required = form.querySelectorAll("[required]");
      var missing = [];
      Array.prototype.forEach.call(required, function (field) {
        if (!String(field.value || "").trim()) missing.push(field);
      });
      if (missing.length) {
        if (error) error.classList.add("is-visible");
        missing[0].focus();
        return;
      }
      if (error) error.classList.remove("is-visible");
      form.classList.add("is-hidden");
      if (success) {
        success.classList.add("is-visible");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
    });
  }
})();
