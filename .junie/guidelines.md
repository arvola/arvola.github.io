# Project Guidelines

This is a fun homepage project with a kitty graphic in different weathers
and times of day.

The goal is to not have any external dependencies aside from the simplex-noise
algorithm. No component libraries, no frameworks. That means writing custom 
DOM manipulation and graphics code. The code should still be as reusable as
possible.

The graphics are built up of reusable graphic "elements" in
`src/header/drawing/elements/`, and each scene is drawn up as spec layers
of JavaScript objects to add the graphic elements. These specs are in
`daytime.ts`, `evening.ts` and `night.ts`.

Another script, links.ts, reads a list of categorized links from Google Sheets
and writes it into `data.json`. The links on the homepage come from this file.
