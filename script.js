(function () {
  var body = document.body;
  var buttons = document.querySelectorAll(".view-btn");
  var storageKey = "jose-site-view-mode";

  function setView(mode) {
    var selectedMode = mode === "legacy" ? "legacy" : "modern";
    body.classList.remove("mode-modern", "mode-legacy");
    body.classList.add("mode-" + selectedMode);

    buttons.forEach(function (button) {
      var isActive = button.getAttribute("data-view") === selectedMode;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
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
})();
