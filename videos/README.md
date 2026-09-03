# Customer videos

Drop the four customer video clips here, named exactly:

```
videos/social-1.mp4
videos/social-2.mp4
videos/social-3.mp4
videos/social-4.mp4
```

Their cover images (posters) go in `../images/`, named:

```
images/social-1-thumb.jpg
images/social-2-thumb.jpg
images/social-3-thumb.jpg
images/social-4-thumb.jpg
```

Once both sets of files exist at those exact paths, the "Hear From Our
Customers" block on the Reviews section (`index.html`) will show the real
cover photos automatically - swap each `<div class="ph" …>` placeholder
there for `<img src="images/social-<n>-thumb.jpg" alt="…">`. No other code
needs to change: clicking play already loads `videos/social-<n>.mp4`
(`js/main.js`, `socialVideos`).
