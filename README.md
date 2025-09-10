# spirals-v1

A simple project for creating ringed spiral eyes. Check it out [here](https://blissful-code.github.io/spirals-v1/).

Inspired by [Tarolewd](https://tarolewd.github.io/me/).

## Usage

Open `index.html` in your browser to get started.

## Settings explanations

Ring Spacing Range: Determines the minimum and maximum "size" that a ring can be. The units are measured as a percentage of the diagonal screen size.

Expansion Speed - The rate of expansion measured in diagonal screen size. This can be expressed as px/sec but scales on a fucntion of screen size.

Color Palette - The set of colors that are displayed in the rings. Order matters.

Randomize Order - When enabled, the order of the colors in the Color Palette are randomized when being displayed.

Ring Separator - When enabled, a ring of varying size and a defined color is played after each color in the Color Palette.

Separator Ring Spacing - In the same fashion that color rings are randomized, this is as well. Please refer to Ring Spacing Range above.

###  Extras

Circular viewport - When enabled, the spirals are made visible through a hole in a variably-transparent cutout.

Extreme Value Bias - Uses beta distribution to encourage more extreme values.

Color Variation - When enabled, colors are shifted slightly in defined range. This ONLY affects colors in the Color Palette, it does NOT affect the ring separator.

Ring Lifetime - The time in milliseconds that a ring lives before it is deleted.