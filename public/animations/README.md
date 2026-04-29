# Animations & Free Resources Guide

This folder contains Lottie animations used throughout the Kids Learning Hub app.

## Current Animations

| File | Description | Usage |
|------|-------------|-------|
| `correct.json` | Green checkmark with burst | Correct answer feedback |
| `wrong.json` | Red X with shake | Wrong answer feedback |
| `star.json` | Spinning golden star | Star earned animation |
| `trophy.json` | Trophy with sparkles | Level up / high score |
| `celebration.json` | Confetti explosion | Game completion |

## How to Add New Animations

### Option 1: Download from LottieFiles (Recommended)

1. Visit [lottiefiles.com](https://lottiefiles.com)
2. Search for animations (e.g., "celebration", "success", "rocket")
3. Download as `.json` (Lottie JSON)
4. Place in this folder (`public/animations/`)
5. Use in component:
   ```tsx
   import { LottiePlayer } from "@/components/animations";
   
   <LottiePlayer animation="filename" size={150} />
   ```

### Option 2: Use LottieFiles CDN
Some popular free animations:
- Celebration: `https://assets3.lottiefiles.com/packages/lf20_u4yrau.json`
- Success: `https://assets4.lottiefiles.com/packages/lf20_jbrw3hcz.json`
- Loading: `https://assets9.lottiefiles.com/packages/lf20_x62chJ.json`

## Free Resource Sites

### Lottie Animations
| Site | URL | Notes |
|------|-----|-------|
| LottieFiles | [lottiefiles.com](https://lottiefiles.com) | Best collection, free & paid |
| IconScout | [iconscout.com/lottie](https://iconscout.com/lottie-animations) | Good for icons |
| Lordicon | [lordicon.com](https://lordicon.com) | Animated icons |

### SVG Icons (Free)
| Site | URL | Notes |
|------|-----|-------|
| Heroicons | [heroicons.com](https://heroicons.com) | Clean modern icons |
| Lucide | [lucide.dev](https://lucide.dev) | Already in project |
| Feather | [feathericons.com](https://feathericons.com) | Minimal icons |
| Phosphor | [phosphoricons.com](https://phosphoricons.com) | Great variety |
| Tabler | [tabler-icons.io](https://tabler-icons.io) | 3000+ icons |
| SVG Repo | [svgrepo.com](https://svgrepo.com) | Huge collection |

### Illustrations (Free)
| Site | URL | Notes |
|------|-----|-------|
| unDraw | [undraw.co](https://undraw.co) | Customizable colors |
| Storyset | [storyset.com](https://storyset.com) | Animated SVGs |
| Open Doodles | [opendoodles.com](https://www.opendoodles.com) | Hand-drawn style |
| Humaaans | [humaaans.com](https://www.humaaans.com) | Mix-and-match people |
| Open Peeps | [openpeeps.com](https://www.openpeeps.com) | Character illustrations |
| Blush | [blush.design](https://blush.design) | Multiple styles |

### Sound Effects (Free)
| Site | URL | Notes |
|------|-----|-------|
| Pixabay | [pixabay.com/sound-effects](https://pixabay.com/sound-effects/) | Game sounds |
| Freesound | [freesound.org](https://freesound.org) | Large library |
| Mixkit | [mixkit.co/free-sound-effects](https://mixkit.co/free-sound-effects/) | High quality |
| ZapSplat | [zapsplat.com](https://www.zapsplat.com) | Categories |

### Fonts (Free)
| Site | URL | Notes |
|------|-----|-------|
| Google Fonts | [fonts.google.com](https://fonts.google.com) | Easy Next.js integration |
| Font Squirrel | [fontsquirrel.com](https://www.fontsquirrel.com) | Web-ready |
| DaFont | [dafont.com](https://www.dafont.com) | Fun fonts |

### Patterns & Backgrounds (Free)
| Site | URL | Notes |
|------|-----|-------|
| Hero Patterns | [heropatterns.com](https://heropatterns.com) | SVG patterns |
| SVG Backgrounds | [svgbackgrounds.com](https://www.svgbackgrounds.com) | Customizable |
| Haikei | [haikei.app](https://app.haikei.app) | SVG generators |
| Pattern Monster | [pattern.monster](https://pattern.monster) | Kids-friendly |

### Color Palettes (Free)
| Site | URL | Notes |
|------|-----|-------|
| Coolors | [coolors.co](https://coolors.co) | Color generator |
| Happy Hues | [happyhues.co](https://www.happyhues.co) | Color combos |
| Colorhunt | [colorhunt.co](https://colorhunt.co) | Curated palettes |

## Usage Examples

### Using LottiePlayer Component
```tsx
import { LottiePlayer } from "@/components/animations";

// Basic usage
<LottiePlayer animation="star" size={100} />

// With callbacks
<LottiePlayer 
  animation="correct"
  size={120}
  loop={false}
  onComplete={() => console.log("Done!")}
/>

// Loop forever
<LottiePlayer animation="celebration" loop size={200} />
```

### Using CelebrationOverlay
```tsx
import { CelebrationOverlay } from "@/components/animations";

<CelebrationOverlay
  show={showCelebration}
  type="levelUp"  // levelUp | newRecord | achievement | allStars | gameComplete
  title="You Did It!"
  subtitle="Keep going!"
  autoClose={3000}
  onComplete={() => setShowCelebration(false)}
/>
```

### Using AnimatedFeedback
```tsx
import { AnimatedFeedback } from "@/components/animations";

<AnimatedFeedback
  type="correct"  // correct | wrong | timeout | levelUp | star
  show={showFeedback}
  size="lg"  // sm | md | lg
  onComplete={() => goToNext()}
/>
```

## Tips for Kids App

1. **Keep animations short** - 1-3 seconds max for feedback
2. **Use looping sparingly** - Only for waiting states
3. **Bright colors** - Kids love vibrant colors
4. **Sound sync** - Pair animations with sound effects
5. **Performance** - Keep file sizes under 100KB

## Converting SVGs to Lottie

Use [LottieFiles Creator](https://lottiefiles.com/creator) or [Bodymovin](https://aescripts.com/bodymovin/) to convert After Effects animations to Lottie JSON.
