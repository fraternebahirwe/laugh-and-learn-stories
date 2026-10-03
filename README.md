# Laugh & Learn Stories

A story app that makes you laugh and leaves you a little wiser.

## Categories (10 stories each)

- 🧸 **Stories for Children** – silly animals and little heroes
- 🧓 **Stories for an Old Man** – gentle tales for a long life well laughed
- 🎧 **Stories for a Teenager** – school, friends, phones and growing up
- 🌍 **Stories for Everybody** – wisdom and giggles for all ages

Open a category, pick a story, and read it on a background that matches its mood
(farm, forest, ocean, space, castle, school, night...). Every story ends with a 💡 wisdom line.
There is also a 🎲 "Surprise me" button.

## Reading experience
- A landscape scene per story mood (farm hills, ocean waves, twinkling night sky, castle, city skyline...)
- Progress bar while reading, text size A− / A+, 🔊 read-aloud, ❤️ favourites
- Stories you finish get a ✅ and fill the progress bar on each category card (saved on your device)

## Run it

No build needed. Open `index.html` in a browser, or:

```
python3 -m http.server 8000
```

## Add a story

Add an object to the right file in `stories/` (`id`, `title`, `emoji`, `theme`, `text[]`, `moral`).
Valid themes are listed in `styles.css` (`.theme-*`).
