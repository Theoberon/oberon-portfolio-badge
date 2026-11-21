(function () {
  "use strict";

  var CONFIG = {
    url: "https://oberon-dev.vercel.app/",
    label: "Want sites like this?",
    accent: "#FF5A1F",
    ink: "#17171A",
    cream: "#EDEAE3",
    size: 48,          // collapsed circle diameter, px
    offset: 24,        // distance from bottom/right edge, px
    expandOnLoadMs: 3000,  // how long it stays expanded on page load
    hoverCollapseDelayMs: 150, // grace period before collapsing after mouseleave
    zIndex: 2147483000
  };

  function init() {
    if (document.getElementById("oberon-badge-host")) return; // don't double-inject

    var host = document.createElement("div");
    host.id = "oberon-badge-host";
    document.body.appendChild(host);

    var shadow = host.attachShadow({ mode: "open" });

    var css = ""
      + ":host{all:initial;}"
      + ".badge{position:fixed;bottom:" + CONFIG.offset + "px;right:" + CONFIG.offset + "px;"
      + "display:flex;align-items:center;height:" + CONFIG.size + "px;width:" + CONFIG.size + "px;"
      + "border-radius:" + (CONFIG.size / 2) + "px;background:" + CONFIG.ink + ";overflow:hidden;"
      + "text-decoration:none;box-shadow:0 6px 20px rgba(0,0,0,0.28);cursor:pointer;"
      + "z-index:" + CONFIG.zIndex + ";transition:width .35s cubic-bezier(.4,0,.2,1);"
      + "font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}"
      // expanded width is measured from the label text (see measure() below);
      // 196px is only a fallback. max-width keeps it on-screen on narrow phones.
      + ".badge.expanded{width:var(--expanded-w,196px);max-width:calc(100vw - " + (CONFIG.offset * 2) + "px);}"
      + ".icon{flex:0 0 " + CONFIG.size + "px;width:" + CONFIG.size + "px;height:" + CONFIG.size + "px;display:flex;}"
      + ".icon svg{width:" + CONFIG.size + "px;height:" + CONFIG.size + "px;display:block;}"
      + ".label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:" + CONFIG.cream + ";"
      + "white-space:nowrap;margin-left:10px;min-width:0;overflow:hidden;text-overflow:ellipsis;"
      + "opacity:0;transition:opacity .2s ease;}"
      + ".badge.expanded .label{opacity:1;}"
      + ".rocket{flex:none;width:18px;height:18px;margin-left:8px;margin-right:16px;display:flex;"
      + "align-items:center;justify-content:center;opacity:0;transition:opacity .2s ease;}"
      + ".rocket svg{width:18px;height:18px;display:block;transform:rotate(45deg);transition:transform .25s ease;}"
      + ".badge.expanded .rocket{opacity:1;}"
      + ".badge:hover .rocket svg{transform:rotate(45deg) translateY(-2px);}"
      + "@media (prefers-reduced-motion: reduce){.badge{transition:none}.label,.rocket,.rocket svg{transition:none}}";

    var style = document.createElement("style");
    style.textContent = css;
    shadow.appendChild(style);

    var badge = document.createElement("a");
    badge.className = "badge";
    badge.href = CONFIG.url;
    badge.target = "_blank";
    badge.rel = "noopener";
    badge.setAttribute("aria-label", CONFIG.label);
    badge.innerHTML = ""
      + '<span class="icon">'
      +   '<svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      +     '<circle cx="28" cy="28" r="28" fill="' + CONFIG.accent + '"/>'
      +     '<circle cx="28" cy="28" r="15" fill="none" stroke="' + CONFIG.ink + '" stroke-width="3"/>'
      +     '<path d="M22.8 24.2 28.6 28.3 22.8 32.4M30.8 33.8h5.6" fill="none" stroke="' + CONFIG.ink + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
      +   '</svg>'
      + '</span>'
      + '<span class="label"></span>'
      + '<span class="rocket" aria-hidden="true">'
      +   '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'
      +     '<path d="M12 2c3.500 3 4.500 7.500 4 12H8c-.5-4.500.5-9 4-12z" fill="' + CONFIG.accent + '"/>'
      +     '<path d="M8 11.500 4.500 15.500V18L8.500 15.500zM16 11.500l3.500 4V18l-4-2.500z" fill="' + CONFIG.accent + '"/>'
      +     '<circle cx="12" cy="9" r="1.900" fill="' + CONFIG.ink + '"/>'
      +     '<path d="M10 15.500c0 3 1 4.500 2 6.500 1-2 2-3.500 2-6.500z" fill="' + CONFIG.cream + '"/>'
      +   '</svg>'
      + '</span>';
    badge.querySelector(".label").textContent = CONFIG.label; // text only, so &, < etc. in the label are safe

    shadow.appendChild(badge);

    // Size the expanded pill to fit whatever label text is configured.
    function measure() {
      var label = badge.querySelector(".label");
      var rocket = badge.querySelector(".rocket");
      // measure the label at its natural width (fractional px), not the shrunk collapsed box
      label.style.flex = "none";
      label.style.overflow = "visible";
      var labelW = label.getBoundingClientRect().width;
      label.style.flex = "";
      label.style.overflow = "";
      var w = CONFIG.size + 10 + Math.ceil(labelW) + 2 + 8 + Math.ceil(rocket.offsetWidth) + 16;
      badge.style.setProperty("--expanded-w", w + "px");
    }
    measure();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

    var hovering = false;
    var collapseTimer = null;

    function expand() { badge.classList.add("expanded"); }
    function collapse() { badge.classList.remove("expanded"); }
    function scheduleCollapse(delay) {
      clearTimeout(collapseTimer);
      collapseTimer = setTimeout(function () {
        if (!hovering) collapse();
      }, delay);
    }

    badge.addEventListener("mouseenter", function () {
      hovering = true;
      clearTimeout(collapseTimer);
      expand();
    });
    badge.addEventListener("mouseleave", function () {
      hovering = false;
      scheduleCollapse(CONFIG.hoverCollapseDelayMs);
    });

    // first-load reveal
    expand();
    scheduleCollapse(CONFIG.expandOnLoadMs);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
