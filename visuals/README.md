# Graph Climbing visual system

Deterministic visual companion to the V2 protocol. SVG is the reproducible design source. Every diagram also has a 2400×1350 PNG export, concise alt text, and a Mermaid semantic companion.

## Editorial hero

- Source: [`editorial-hero.svg`](editorial-hero.svg)
- Export: [`editorial-hero.png`](editorial-hero.png)
- Alt text: [`editorial-hero.alt.md`](editorial-hero.alt.md)
- Semantic companion: [`editorial-hero.mmd`](editorial-hero.mmd)
- Imagegen disposition and exact prompt: [`imagegen-editorial-hero.prompt.md`](imagegen-editorial-hero.prompt.md)

The generated candidate was rejected because literal block peaks read as mountains and staircases. The adopted hero is the text-free deterministic SVG fallback.

## Diagrams

- Kernel and Authority Stack: [`SVG`](kernel-authority-stack.svg), [`PNG`](kernel-authority-stack.png), [`alt text`](kernel-authority-stack.alt.md), [`Mermaid`](kernel-authority-stack.mmd)
- Layered Claim-first plus parallel Verticals: [`SVG`](layered-claim-first.svg), [`PNG`](layered-claim-first.png), [`alt text`](layered-claim-first.alt.md), [`Mermaid`](layered-claim-first.mmd)
- One Climb with Reconciliation and Review Reopen: [`SVG`](one-climb-reconcile-reopen.svg), [`PNG`](one-climb-reconcile-reopen.png), [`alt text`](one-climb-reconcile-reopen.alt.md), [`Mermaid`](one-climb-reconcile-reopen.mmd)
- DACS mapping — ISA → Features → Beads → Evidence: [`SVG`](dacs-mapping.svg), [`PNG`](dacs-mapping.png), [`alt text`](dacs-mapping.alt.md), [`Mermaid`](dacs-mapping.mmd)

## Export

Use a browser viewport, not Chrome's `--window-size`, which includes browser chrome and can add a white strip.

```bash
browse viewport 2400x1350
browse goto "file://$PWD/visuals/kernel-authority-stack.svg"
browse wait --load
browse screenshot --viewport "$PWD/visuals/kernel-authority-stack.png"
```

Repeat for each SVG. Verify every PNG is exactly 2400×1350 and its corner pixels belong to the artwork.

## Design contract

- Near-black navy foundation; cobalt, mint, violet, and amber functional accents.
- Amber means evidence or verification; mint means reconciliation or verified shared state.
- Red is reserved for accepted review findings and reopened claims.
- Parallel verticals stay visually and operationally separate.
- No generated diagram text. No decorative arrow may imply a false dependency.

## QA

Preview source: [`preview.html`](preview.html).

Checked at 1440×1000 desktop, 1012×900 GitHub-content width, and 390×844 mobile in both light and dark surrounding contexts. All SVGs loaded, pages had no horizontal overflow, diagrams stayed inside their cards, and the four explanatory diagrams had no clipped text or colliding arrows. PNG exports were verified at 2400×1350 with full artwork to every edge.
