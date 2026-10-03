(function () {
  const app = document.getElementById("app");
  const decor = document.getElementById("decor");

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
      el("h1", { textContent: "Laugh & Learn" }),
      el("p", { className: "sub", textContent: "Stories that make you smile and leave you wiser. Pick a category." }),
      el("div", { className: "grid" }, CATEGORIES.map(c => {
        const b = el("a", { className: "card cat theme-" + c.theme, href: "#/" + c.id }, [
          el("div", { className: "big", textContent: c.emoji }),
          el("h2", { textContent: c.title }),
          el("p", { textContent: c.blurb }),
          el("small", { textContent: (STORIES[c.id] || []).length + " stories" })
        ]);
        return b;
      }))
    );
  }

  function category(id) {
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return home();
    setTheme(cat.theme);
    const list = STORIES[id] || [];
    app.replaceChildren(
      el("a", { className: "back", href: "#/", textContent: "← All categories" }),
      el("h1", { textContent: cat.emoji + " " + cat.title }),
      el("div", { className: "list" }, list.map((s, i) =>
        el("a", { className: "card story-item", href: "#/" + id + "/" + s.id }, [
          el("span", { className: "num", textContent: s.emoji }),
          el("div", {}, [
            el("h3", { textContent: s.title }),
            el("small", { textContent: "Story " + (i + 1) + " · " + s.theme })
          ])
        ])
      ))
    );
  }

  function story(catId, storyId) {
    const list = STORIES[catId] || [];
    const idx = list.findIndex(s => s.id === storyId);
    if (idx < 0) return category(catId);
    const s = list[idx];
    setTheme(s.theme);
    const nav = el("div", { className: "nav" }, [
      idx > 0 ? el("a", { href: "#/" + catId + "/" + list[idx - 1].id, textContent: "← Previous" }) : el("span"),
      idx < list.length - 1 ? el("a", { href: "#/" + catId + "/" + list[idx + 1].id, textContent: "Next →" }) : el("span")
    ]);
    app.replaceChildren(
      el("a", { className: "back", href: "#/" + catId, textContent: "← Back to stories" }),
      el("article", { className: "card reader" }, [
        el("div", { className: "big", textContent: s.emoji }),
        el("h1", { textContent: s.title }),
        ...s.text.map(p => el("p", { textContent: p })),
        el("div", { className: "moral" }, [el("strong", { textContent: "💡 Wisdom: " }), s.moral])
      ]),
      nav
    );
    window.scrollTo(0, 0);
  }

  function route() {
    const [, cat, id] = location.hash.split("/");
    if (!cat) home();
    else if (!id) category(cat);
    else story(cat, id);
  }

  window.addEventListener("hashchange", route);
  route();
})();
