## Consolidated

## Recent
[chat] Never set fixed pixel `width`/`height` directly on `<img>` elements in sections/blocks. The theme's `assets/base.css` (line 48) applies a global `img { width: 100%; height: auto }` baseline that works with `srcset` and merchant uploads of any aspect ratio. Fixed `<img>` sizing fights this baseline and breaks when logos/photos aren't the exact dimensions in Figma. Instead, size the WRAPPER (`.section__image { width: 148px; height: 74px }`) and let the `<img>` fill it with `max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain`. This is the pattern used by `.background-image-container img`, `.card-gallery > img`, `.product-media-container img` in base.css.
[chat] When Figma shows an image at fixed pixel dimensions (e.g. 148x74 logo), translate those dimensions onto the WRAPPER div, never the `<img>` itself. The image element should always stay fluid via `max-width: 100%` + `object-fit`.
