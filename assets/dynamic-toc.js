const tocId = "table-of-contents";
const contentSelector = "#content";
let showAll = false;
let currentActiveLinkId = null;
let elemsToHide = [];
let linksById = {};
let toggleBtn = null;

let headerObserver = null;

function localizedCopy() {
  const lang = document.documentElement.lang || "";
  if (lang.startsWith("zh")) {
    return {
      open: "显示目录",
      close: "隐藏目录",
      toggleLabel: "切换目录显示",
    };
  }
  return {
    open: "Show contents",
    close: "Hide contents",
    toggleLabel: "Toggle the table of contents",
  };
}

function observeHeadings() {
  const tocElem = document.getElementById(tocId);
  if (!tocElem) {
    return;
  }

  linksById = {};
  elemsToHide = [];
  currentActiveLinkId = null;

  const links = document.querySelectorAll(`#${tocId} a`);
  const headings = document.querySelectorAll(
    `${contentSelector} h1, ${contentSelector} h2, ${contentSelector} h3, ${contentSelector} h4`,
  );

  if (!links.length || !headings.length) {
    return;
  }

  for (const link of links) {
    linksById[link.getAttribute("href")] = link;
  }
  for (const elem of document.querySelectorAll(`#${tocId} ul`)) {
    if (elem.parentElement.id !== tocId) {
      elemsToHide.push(elem);
    }
  }

  headerObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && linksById[`#${entry.target.id}`]) {
          currentActiveLinkId = `#${entry.target.id}`;
          break;
        }
      }
      if (currentActiveLinkId) {
        for (const link of links) {
          link.classList.remove("active");
        }
        linksById[currentActiveLinkId].classList.add("active");

        if (!showAll) {
          hideHeadings();
        }
      }
    },
    {
      threshold: 0.1,
      root: null,
      rootMargin: "0px 0px -55% 0px",
    },
  );

  for (const heading of headings) {
    headerObserver.observe(heading);
  }
  hideHeadings();
}

function observeButtons() {
  const unhideButton = document.getElementById("unhide-all-button");
  const hideButton = document.getElementById("hide-all-button");
  unhideButton.addEventListener("click", () => {
    showAll = true;
    showHeadings();
    unhideButton.classList.add("hidden");
    hideButton.classList.remove("hidden");
  });
  hideButton.addEventListener("click", () => {
    showAll = false;
    hideHeadings();
    hideButton.classList.add("hidden");
    unhideButton.classList.remove("hidden");
  });
  unhideButton.classList.remove("hidden");
}

function hideHeadings() {
  for (const elem of elemsToHide) {
    elem.classList.remove("shown");
  }
  if (!currentActiveLinkId) {
    return;
  }
  for (
    let elem = linksById[currentActiveLinkId];
    (elem = elem.parentElement);
    elem.id !== tocId
  ) {
    elem.classList.add("shown");
  }
  for (const elem of linksById[currentActiveLinkId].parentElement.children) {
    elem.classList.add("shown");
  }
}

function showHeadings() {
  for (const elem of elemsToHide) {
    elem.classList.add("shown");
  }
}

function setUpObserver() {
  if (document.documentElement.clientWidth >= 1300) {
    if (headerObserver === null) {
      observeHeadings();
      // observeButtons();
    }
    hideToggleBtn();
  } else {
    if (headerObserver !== null) {
      headerObserver.disconnect();
      headerObserver = null;
      showHeadings();
    }
    setUpTocToggleBtn();
  }
}

function toggleTocVisibity() {
  const tocElem = document.getElementById(tocId);
  if (!tocElem || !toggleBtn) {
    return;
  }

  if (tocElem.classList.contains("show-all")) {
    tocElem.classList.remove("show-all");
    toggleBtn.textContent = localizedCopy().open;
    toggleBtn.setAttribute("aria-expanded", "false");
  } else {
    tocElem.classList.add("show-all");
    toggleBtn.textContent = localizedCopy().close;
    toggleBtn.setAttribute("aria-expanded", "true");
  }
}

function setUpTocToggleBtn() {
  const tocElem = document.getElementById(tocId);
  if (!tocElem) {
    return;
  }

  if (!toggleBtn) {
    const copy = localizedCopy();
    toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "toc-toggle-btn";
    toggleBtn.textContent = copy.open;
    toggleBtn.setAttribute("aria-controls", tocId);
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", copy.toggleLabel);
    toggleBtn.addEventListener("click", toggleTocVisibity);
    tocElem.append(toggleBtn);
  }
  toggleBtn.hidden = false;
}

function hideToggleBtn() {
  if (toggleBtn) {
    toggleBtn.hidden = true;
  }
}

window.addEventListener("load", () => {
  if ("IntersectionObserver" in window) {
    setUpObserver();
    window.addEventListener("resize", setUpObserver);
  }
});

window.addEventListener("unload", () => {
  if (headerObserver) {
    headerObserver.disconnect();
  }
});
