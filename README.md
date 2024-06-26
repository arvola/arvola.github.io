# Arvola Home

This is a simple homepage for [arvola.com](https://arvola.com), with links to some stuff.

It is largely written from scratch:

- The only JavaScript library being used in production is [simplex-noise](https://www.npmjs.com/package/simplex-noise) - 
  it seemed silly to rewrite a basic algorithm for noise. 
- The build tools in development are existing tools.
- The graphics are mostly generated with code, with a few exceptions:
  - The kitty is a vector drawing of mine.
  - The icons for categories are from [MingCute](https://www.mingcute.com/).
  - The milkyway for night is generated by code, but due to its complexity it's quite slow to create. I saved
    the generated image to a file to avoid the delay.

## Links

The links are pulled from a Google Sheet by running [`scripts/links.ts`](./scripts/links.ts) with `npm run links`.
The images are processed into a suitable size and cropped if needed, and the data is saved into 
[`src/data.json`](./src/data.json).

I wanted it to be simple for my wife to edit the links as well, and a Google Sheet seemed like an easy solution.

## Graphic

The landscape with the kitty is drawn with canvas, and I would like to add more dynamic elements to it:

- Show the weather, such as animated rain or snow.
- Add flowers appropriate for the season that we grow in our yard.
- Christmas? Eclipses? Comets? Meteor showers?

If I have the time and inspiration, incorporating some kind of game would also be fun.
