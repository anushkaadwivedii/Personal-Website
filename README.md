# Anushka Dwivedi — Personal Portfolio

My personal portfolio, built to share my experience, projects, and hobbies in two different ways:

- **Classic portfolio:** A straightforward, section-based version of the site.
- **Interactive city:** A rainy 3D city where each building represents part of my portfolio.

The interactive version turns the portfolio into a small explorable world with project districts, experience buildings, hobby locations, pedestrians, cyclists, music, and mobile driving controls.

## Live site

[View the live portfolio](https://personal-website-lac-three-52.vercel.app/)

## Features

- Responsive landing page with two ways to enter the portfolio
- Classic portfolio covering my background, experience, projects, and hobbies
- Interactive 3D city with distinct portfolio districts
- Drivable vehicle with desktop and mobile controls
- Building interactions containing the complete portfolio content
- City minimap and district navigation signs
- Rain, lighting, pedestrians, dog walkers, and cyclists
- Lo-fi background music with playback and volume controls
- Responsive layouts for desktop, tablet, and mobile screens

## City controls

### Desktop

- `W` or `↑`: Drive forward
- `S` or `↓`: Reverse
- `A` or `←`: Steer left
- `D` or `→`: Steer right
- `Space`: Explore a nearby location
- `Space` or `Esc`: Close an open location

### Mobile

Use the on-screen directional controls to drive and the **Explore** button to open or close a nearby location.

## Built with

- React
- TypeScript
- Three.js
- React Three Fiber
- React Three Drei
- React Three Rapier
- React Router
- Vite

## Run locally

```bash
git clone https://github.com/anushkaadwivedii/Personal-Website.git
cd Personal-Website
npm install
npm run dev
```

Open the local address shown by Vite in your browser.

## Available commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run lint     # Run ESLint
```

## Routes

- `/` — Landing page
- `/portfolio` — Classic portfolio
- `/city` — Interactive city

## Asset credits

- **City music:** “Velvet Rain – Chill Lo-fi Rainy Night Beat” by VibeVault5, downloaded from [Pixabay](https://pixabay.com/music/beats-velvet-rain-chill-lo-fi-rainy-night-beat-350255/) and used under the [Pixabay Content License](https://pixabay.com/service/license-summary/).
- **Vehicle model:** Toy Car Kit by [Kenney](https://www.kenney.nl/), licensed under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).

Additional soundtrack details are available in [`public/audio/README.md`](public/audio/README.md).

## Author

Built by [Anushka Dwivedi](https://github.com/anushkaadwivedii).
