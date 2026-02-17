(function () {
  var body = document.body;
  var buttons = document.querySelectorAll(".view-btn");
  var storageKey = "jose-site-view-mode";
  var sectionStorageKey = "jose-site-active-section";
  var defaultSectionId = "selected-papers";
  var main = document.querySelector("main");
  var navLinks = document.querySelectorAll('.top-nav a[href^="#"]');
  var sections = document.querySelectorAll("main > section.content-block[id]");

  function sectionExists(sectionId) {
    return Array.prototype.some.call(sections, function (section) {
      return section.id === sectionId;
    });
  }

  function sectionFromHash() {
    if (!window.location.hash || window.location.hash.length < 2) {
      return "";
    }
    return window.location.hash.slice(1);
  }

  function setActiveSection(sectionId, syncHash) {
    var selectedSectionId = sectionExists(sectionId) ? sectionId : defaultSectionId;

    Array.prototype.forEach.call(sections, function (section) {
      section.classList.toggle("is-active-section", section.id === selectedSectionId);
    });

    Array.prototype.forEach.call(navLinks, function (link) {
      var href = link.getAttribute("href") || "";
      var targetId = href.charAt(0) === "#" ? href.slice(1) : "";
      var isCurrent = targetId === selectedSectionId;
      link.classList.toggle("is-current", isCurrent);
      if (isCurrent) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    localStorage.setItem(sectionStorageKey, selectedSectionId);

    if (syncHash) {
      window.history.replaceState(null, "", "#" + selectedSectionId);
    }
  }

  function syncSectionBehaviorForView() {
    if (!main) {
      return;
    }

    var isModern = body.classList.contains("mode-modern");

    if (!isModern) {
      main.classList.remove("tabbed-main");
      Array.prototype.forEach.call(sections, function (section) {
        section.classList.remove("is-active-section");
      });
      Array.prototype.forEach.call(navLinks, function (link) {
        link.classList.remove("is-current");
        link.removeAttribute("aria-current");
      });
      return;
    }

    main.classList.add("tabbed-main");

    var hashSection = sectionFromHash();
    var storedSection = localStorage.getItem(sectionStorageKey);
    var initialSectionId = sectionExists(hashSection)
      ? hashSection
      : sectionExists(storedSection)
        ? storedSection
        : defaultSectionId;

    setActiveSection(initialSectionId, sectionExists(hashSection));
  }

  function setView(mode) {
    var selectedMode = mode === "legacy" ? "legacy" : "modern";
    body.classList.remove("mode-modern", "mode-legacy");
    body.classList.add("mode-" + selectedMode);

    buttons.forEach(function (button) {
      var isActive = button.getAttribute("data-view") === selectedMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    syncSectionBehaviorForView();
  }

  var storedMode = localStorage.getItem(storageKey);
  setView(storedMode === "legacy" ? "legacy" : "modern");

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var mode = button.getAttribute("data-view");
      setView(mode);
      localStorage.setItem(storageKey, mode);
    });
  });

  Array.prototype.forEach.call(navLinks, function (link) {
    link.addEventListener("click", function (event) {
      if (!body.classList.contains("mode-modern")) {
        return;
      }

      var href = link.getAttribute("href") || "";
      var targetSectionId = href.charAt(0) === "#" ? href.slice(1) : "";

      if (!sectionExists(targetSectionId)) {
        return;
      }

      event.preventDefault();
      setActiveSection(targetSectionId, true);
    });
  });

  window.addEventListener("hashchange", function () {
    if (!body.classList.contains("mode-modern")) {
      return;
    }

    var hashSectionId = sectionFromHash();
    if (sectionExists(hashSectionId)) {
      setActiveSection(hashSectionId, false);
    }
  });
})();
