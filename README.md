# spirals-v1

A simple web-based visualization tool that creates expanding ringed spirals from the center of the screen. Each ring grows outward with customizable colors, spacing, and effects.

[**Try it live**](https://blissful-code.github.io/spirals-v1/)

![Demo](https://raw.githubusercontent.com/blissful-code/blissful-assets/main/spiralsv1_demo1.gif)

## Contributing

Contributions and Pull Requests are welcome! It might take me some time to see them, so DM me on another platform for faster turnaround on approvals.

## Usage

Open `index.html` in your browser to get started.

## Settings explanations

**Ring Spacing Range:** Controls the minimum and maximum distance between consecutive rings. Measured as a percentage of the screen's diagonal length.

**Expansion Speed:** How fast rings grow outward from the center. Expressed as a percentage of screen diagonal per second (scales with screen size).

**Color Palette:** The sequence of colors used for the rings. The order determines the pattern.

**Randomize Order:** When enabled, the colors are shuffled into a random sequence that repeats until the palette is modified or the setting is toggled.

**Ring Separator:** When enabled, a separator ring appears between each color in the palette.

**Separator Ring Spacing:** Controls the spacing range for separator rings, using the same percentage-of-diagonal system as main rings.

### Extras

**Circular viewport:** Creates a circular "window" through which the spirals are visible, with an adjustable transparent overlay.

**Extreme Value Bias:** Uses statistical bias to favor more extreme ring sizes (very large or very small) rather than average sizes.

**Color Variation:** Adds subtle random color shifts to palette colors. Does not affect separator rings.

**Ring Lifetime:** How long (in milliseconds) each ring remains visible before disappearing.

## Analytics

This project uses [GoatCounter](https://www.goatcounter.com/) for privacy-friendly web analytics. The analytics script is designed to only load when the site is accessed from a production domain (not localhost, local IPs, or file:// URLs).

**For local development:** The analytics won't trigger when you run this locally, so you can develop and test without affecting the analytics data.

**For forkers/cloners:** If you're hosting your own version, you can safely delete the GoatCounter script tag from `index.html`, or replace it with your own analytics solution.

## Credits

Inspired by [Tarolewd](https://tarolewd.github.io/me/).

Thanks to Lompich and Chris for QA testing!

## License

This project is released under the MIT License. Feel free to use, modify, and distribute as you see fit. Just don't blame me if something breaks! 😄