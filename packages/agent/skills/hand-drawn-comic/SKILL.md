---
name: hand-drawn-comic
description: Code-drawn editorial comic explainers using JavaScript + SVG/Canvas. No image generation.
---

# Hand-drawn Comic Renderer

This is the default visual system for Animus.

The target is an **editorial cartoon / animated-comic still**, not an infographic:
- oversized expressive heads and eyes
- thin limbs but strong poses
- thick, slightly irregular black outlines
- flat colors with strong shot-to-shot palette changes
- wonky but readable perspective
- dense props that make a place feel inhabited
- very little overlay text
- visual metaphors and physical jokes
- bespoke shot drawings are preferred over component assembly

## Hard rules

1. **Never use image generation.** Do not call an image model and do not download AI-generated art.
2. Draw with JavaScript. SVG path data and Canvas 2D are allowed.
3. A reusable primitive is construction help, not the finished art. The final shot must read like one authored drawing.
4. Characters must physically interact with props. Avoid “person standing next to icon.”
5. The face carries production value: head angle, eyelids, brows, eye size, mouth silhouette and deformation should vary by shot.
6. Use whole-shot composition changes rather than trying to animate one master layout.
7. Prefer a new composition every ~2–4 seconds in a finished video. Holds are fine; gratuitous tweening is not.
8. Explanatory text should usually live inside the world: labels, receipts, signs, screens, books, price tags.
9. Build important props in the shot-specific drawing instead of relying on generic icon libraries.
10. Check every panel at full size and 240 px wide.

## Visual grammar

- Canvas: 1920×1080 or 1600×900, 16:9.
- Outer contour: 6–10 px near-black.
- Inner detail: 3–5 px.
- Eyes: solid black masses, deliberately oversized.
- Backgrounds: 2–4 flat tones, not gradients by default.
- Head-to-body ratio may be 2.5:1 to 4:1.
- Perspective can be imperfect but must describe a real place.
- Do not add random wobble to every frame. Irregularity is authored in the path geometry.
- Do not use Rough.js as a substitute for drawing.

## Shot design test

For every narration beat, write the funniest useful **picture**, not the most literal diagram.

Bad:
- heading “EYE LEVEL”
- shelf rectangle
- arrow

Good:
- shopper hypnotised by expensive cereal at eye level
- cheap cereal living sadly near the floor
- knees visibly doing the bargain hunting

## Project structure

```
film.mjs
lib/
  comic-svg.mjs
shots/
  001-opening.mjs
  002-cutaway.mjs
render/
```

Use `/home/daytona/skill/assets/comic-svg.mjs` as the base helper library. Copy it locally before editing it.

## Rendering contract

The entry `.mjs` file must accept:

```
node film.mjs --output /absolute/path/output.mp4 --quality low|high
```

It should:
1. author shot SVGs or Canvas frames,
2. rasterize with `rsvg-convert` or ImageMagick,
3. build a deterministic frame/shot sequence,
4. encode with ffmpeg,
5. write exactly the requested MP4 path.

For a still-only request, render a PNG/SVG and do not invent animation.

## Quality gate

Reject the render and redraw if it looks like:
- a slide deck,
- a LinkedIn carousel,
- clip-art assembled from symbols,
- one reusable mascot pasted into every scene,
- clean UI illustration with labels floating around it.

The target is a comic panel that remains readable with the audio muted.
