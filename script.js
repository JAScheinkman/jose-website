(function () {
  var body = document.body;
  var buttons = document.querySelectorAll(".view-btn");
  var storageKey = "jose-site-view-mode";
  var sectionStorageKey = "jose-site-active-section";
  var defaultSectionId = "selected-papers";
  var main = document.querySelector("main");
  var navLinks = document.querySelectorAll('.top-nav a[href^="#"]');
  var sections = document.querySelectorAll("main > section.content-block[id]");
  var paperCards = document.querySelectorAll("#selected-papers .plain-list li");

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

  function firstMeaningfulTextNode(container) {
    var child = container.firstChild;
    while (child) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
        return child;
      }
      child = child.nextSibling;
    }
    return null;
  }

  function normalizeLeadingComma(container) {
    var textNode = firstMeaningfulTextNode(container);
    if (!textNode) {
      return;
    }
    textNode.textContent = textNode.textContent.replace(/^\s*,\s*/, "");
  }

  function extractLeadingCoauthors(container) {
    var textNode = firstMeaningfulTextNode(container);
    if (!textNode) {
      return "";
    }

    var match = textNode.textContent.match(/^\s*\((with[^)]+)\)\s*(?:[.,;:]\s*)?/i);
    if (!match) {
      return "";
    }

    textNode.textContent = textNode.textContent.replace(match[0], "");
    return match[1].replace(/^with/i, "With").trim();
  }

  function enhanceSelectedPapers() {
    Array.prototype.forEach.call(paperCards, function (item) {
      var titleLink = item.querySelector("a[href]");
      if (!titleLink) {
        return;
      }

      var href = titleLink.getAttribute("href");
      if (!href) {
        return;
      }

      var titleText = titleLink.textContent.trim();
      var openInNewTab = titleLink.getAttribute("target") === "_blank";
      var titleElement = document.createElement("p");
      titleElement.className = "paper-title";
      titleElement.textContent = titleText;
      titleLink.replaceWith(titleElement);

      var meta = document.createElement("div");
      meta.className = "paper-meta";
      while (titleElement.nextSibling) {
        meta.appendChild(titleElement.nextSibling);
      }

      normalizeLeadingComma(meta);
      var coauthorText = extractLeadingCoauthors(meta);
      normalizeLeadingComma(meta);
      item.appendChild(meta);

      if (coauthorText) {
        var coauthorLine = document.createElement("p");
        coauthorLine.className = "paper-coauthors";
        coauthorLine.textContent = coauthorText;
        item.insertBefore(coauthorLine, meta);
      }

      item.classList.add("paper-card");
      item.setAttribute("tabindex", "0");
      item.setAttribute("role", "link");
      item.setAttribute("aria-label", "Open paper: " + titleText);

      function openPaper() {
        if (openInNewTab) {
          window.open(href, "_blank", "noopener,noreferrer");
          return;
        }
        window.location.href = href;
      }

      item.addEventListener("click", function (event) {
        if (event.target && typeof event.target.closest === "function" && event.target.closest("a")) {
          return;
        }
        openPaper();
      });

      item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPaper();
        }
      });
    });
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

  enhanceSelectedPapers();

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
    var hashSectionId = sectionFromHash();
    if (sectionExists(hashSectionId)) {
      setActiveSection(hashSectionId, false);
    }
  });
})();
