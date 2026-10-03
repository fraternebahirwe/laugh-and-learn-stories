(function () {
  const app = document.getElementById("app");
  const decor = document.getElementById("decor");

  // ---- saved on this device: read stories, favourites, text size ----
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem("stories." + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("stories." + k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } }
  };
  let read = new Set(store.get("read", []));
  let favs = new Set(store.get("favs", []));
  let scale = store.get("scale", 1);
  const key = (c, id) => c + "/" + id;

  const ACCENT = { farm: "#ffb347", village: "#d4a373", school: "#b39dff", night: "#6c6fd1", forest: "#6bbd5b", ocean: "#4cc3ff",
                   space: "#9b6cff", desert: "#ffb35c", castle: "#a79bff", city: "#ff7a9a", mountain: "#8ec5e8", kitchen: "#ffcf70" };

  let toastTimer;
  function toast(text) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.append(t); }
    t.textContent = text;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function stopSpeech() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }

  const THEMES = {
    home:    ["✨", "📖", "⭐", "🌈"],
    farm:    ["🐓", "🌾", "🐄", "🌻", "🐑"],
    village: ["🏡", "🌳", "🐕", "🍵", "🌄"],
    school:  ["📚", "✏️", "🎒", "💡", "🎧"],
    night:   ["🌙", "⭐", "🦉", "✨", "💫"],
    forest:  ["🌲", "🍄", "🦊", "🐿️", "🍃"],
    ocean:   ["🐠", "🌊", "🐙", "🫧", "🐚"],
    space:   ["🚀", "🪐", "⭐", "👽", "☄️"],
    desert:  ["🌵", "🐪", "☀️", "🏜️", "🦂"],
    castle:  ["🏰", "👑", "🐉", "⚔️", "🛡️"],
    city:    ["🏙️", "🚕", "🚌", "🌆", "📱"],
    mountain:["⛰️", "🐐", "❄️", "🦅", "🌨️"],
    kitchen: ["🍳", "🥖", "🍲", "🧁", "🍅"]
  };

  function setTheme(theme) {
    document.body.className = "theme-" + theme;
    decor.innerHTML = "";
    const icons = THEMES[theme] || THEMES.home;
    for (let i = 0; i < 14; i++) {
      const s = document.createElement("span");
      s.textContent = icons[i % icons.length];
      s.style.left = Math.round(Math.random() * 95) + "%";
      s.style.animationDuration = 12 + Math.random() * 14 + "s";
      s.style.animationDelay = -Math.random() * 20 + "s";
      s.style.fontSize = 22 + Math.random() * 28 + "px";
      decor.appendChild(s);
    }
  }

  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    Object.assign(e, attrs || {});
    (children || []).forEach(c => e.append(c));
    return e;
  }

  function home() {
    setTheme("home");
    app.replaceChildren(
      el("div", { className: "hero" }, [
        el("div", { className: "logo", textContent: "📖" }),
        el("h1", { textContent: "Laugh & Learn" }),
        el("p", { className: "sub", textContent: "Stories that make you smile and leave you wiser. Pick a category." })
      ]),
      el("div", { className: "grid enter" }, CATEGORIES.map((c, i) => {
        const list = STORIES[c.id] || [];
        const done = list.filter(s => read.has(key(c.id, s.id))).length;
        const card = el("a", { className: "card cat cat-" + c.id, href: "#/" + c.id }, [
          el("div", { className: "big", textContent: c.emoji }),
          el("h2", { textContent: c.title }),
          el("p", { textContent: c.blurb }),
          el("div", { className: "count" }, [el("span", { textContent: list.length + " stories" }), el("span", { textContent: done + " read" })]),
          el("div", { className: "meter" }, [el("i", { style: "width:" + (list.length ? Math.round(done / list.length * 100) : 0) + "%" })])
        ]);
        card.style.setProperty("--i", i);
        return card;
      }))
    );
  }

  function category(id) {
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return home();
    setTheme(cat.theme);
    const list = STORIES[id] || [];
    const items = list.map((s, i) => {
      const isRead = read.has(key(id, s.id));
      const a = el("a", { className: "card story-item" + (isRead ? " read" : ""), href: "#/" + id + "/" + s.id }, [
        el("span", { className: "num", textContent: s.emoji }),
        el("div", { className: "grow" }, [
          el("h3", { textContent: s.title }),
          el("small", { textContent: "Story " + (i + 1) + " · " + s.theme })
        ]),
        el("span", { className: "marks", textContent: (favs.has(key(id, s.id)) ? "❤️ " : "") + (isRead ? "✅" : "") })
      ]);
      a.style.setProperty("--a", ACCENT[s.theme] || "#ffb347");
      a.style.setProperty("--i", i);
      return a;
    });
    app.replaceChildren(
      el("a", { className: "back", href: "#/", textContent: "← All categories" }),
      el("h1", { textContent: cat.emoji + " " + cat.title }),
      el("p", { className: "sub", textContent: list.filter(s => read.has(key(id, s.id))).length + " of " + list.length + " read" }),
      el("div", { className: "list enter" }, items)
    );
  }

  function story(catId, storyId) {
    const list = STORIES[catId] || [];
    const idx = list.findIndex(s => s.id === storyId);
    if (idx < 0) return category(catId);
    const s = list[idx];
    const k = key(catId, s.id);
    setTheme(s.theme);

    const nav = el("div", { className: "nav" }, [
      idx > 0 ? el("a", { href: "#/" + catId + "/" + list[idx - 1].id, textContent: "← Previous" }) : el("span"),
      idx < list.length - 1 ? el("a", { className: "next", href: "#/" + catId + "/" + list[idx + 1].id, textContent: "Next story →" }) : el("a", { className: "next", href: "#/" + catId, textContent: "All stories ✓" })
    ]);

    const paras = s.text.map((p, i) => { const e = el("p", { textContent: p }); e.style.setProperty("--i", i); return e; });
    const moral = el("div", { className: "moral" }, [el("strong", { textContent: "💡 Wisdom: " }), s.moral]);

    const favBtn = el("button", { type: "button", textContent: favs.has(k) ? "❤️ Saved" : "🤍 Save" });
    favBtn.setAttribute("aria-pressed", favs.has(k));
    favBtn.addEventListener("click", () => {
      favs.has(k) ? favs.delete(k) : favs.add(k);
      store.set("favs", [...favs]);
      favBtn.textContent = favs.has(k) ? "❤️ Saved" : "🤍 Save";
      favBtn.setAttribute("aria-pressed", favs.has(k));
      toast(favs.has(k) ? "Saved to your favourites ❤️" : "Removed from favourites");
    });

    const size = d => () => { scale = Math.min(1.6, Math.max(.85, +(scale + d).toFixed(2))); store.set("scale", scale); card.style.setProperty("--scale", scale); };
    const listen = el("button", { type: "button", textContent: "🔊 Listen" });
    let speaking = false;
    function speak() {
      if (!("speechSynthesis" in window)) return toast("Read-aloud is not supported in this browser");
      if (speaking) { stopSpeech(); return; }
      speaking = true;
      listen.textContent = "⏹ Stop"; listen.setAttribute("aria-pressed", "true");
      const parts = [...paras];
      (function next(i) {
        if (!speaking || i >= parts.length) { speaking = false; listen.textContent = "🔊 Listen"; listen.setAttribute("aria-pressed", "false"); parts.forEach(p => p.classList.remove("speaking")); return; }
        parts.forEach(p => p.classList.remove("speaking"));
        parts[i].classList.add("speaking");
        const u = new SpeechSynthesisUtterance(i === parts.length - 1 ? s.text[i] + " ... Wisdom: " + s.moral : s.text[i]);
        u.rate = 0.95;
        u.onend = () => next(i + 1);
        u.onerror = () => { speaking = false; next(parts.length); };
        speechSynthesis.speak(u);
      })(0);
    }
    listen.addEventListener("click", () => { if (speaking) { speaking = false; stopSpeech(); listen.textContent = "🔊 Listen"; listen.setAttribute("aria-pressed", "false"); paras.forEach(p => p.classList.remove("speaking")); } else speak(); });

    const toolbar = el("div", { className: "toolbar" }, [
      el("button", { type: "button", textContent: "A−", onclick: size(-0.1) }),
      el("button", { type: "button", textContent: "A+", onclick: size(0.1) }),
      listen, favBtn
    ]);

    const card = el("article", { className: "card reader" }, [
      el("div", { className: "big", textContent: s.emoji }),
      el("h1", { textContent: s.title }),
      ...paras, moral
    ]);
    card.style.setProperty("--scale", scale);

    app.replaceChildren(el("a", { className: "back", href: "#/" + catId, textContent: "← Back to stories" }), toolbar, card, nav);
    window.scrollTo(0, 0);

    // reaching the wisdom line counts as "read" and reveals it with a little flourish
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      moral.classList.add("show");
      if (!read.has(k)) { read.add(k); store.set("read", [...read]); toast("Story finished ✅"); }
      io.disconnect();
    }, { threshold: 0.6 });
    io.observe(moral);
  }

  // thin reading-progress bar along the top of the page
  const bar = el("div", { className: "progress" });
  document.body.append(bar);
  window.addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (location.hash.split("/")[2] && h > 0 ? Math.min(100, scrollY / h * 100) : 0) + "%";
  }, { passive: true });

  function route() {
    stopSpeech();
    const [, cat, id] = location.hash.split("/");
    if (!cat) home();
    else if (cat === "random") {
      const c = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const l = STORIES[c.id];
      location.replace("#/" + c.id + "/" + l[Math.floor(Math.random() * l.length)].id);
    }
    else if (!id) category(cat);
    else story(cat, id);
  }

  window.addEventListener("hashchange", route);
  route();
})();
