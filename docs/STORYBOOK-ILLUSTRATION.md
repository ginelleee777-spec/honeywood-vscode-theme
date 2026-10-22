# Storybook scene: provenance and design

**File:** `images/storybook/honeywood-woodland.svg`, the default, animated picture in the Honeywood Storybook view (version 1.2.0).

## How it was made

- Hand-written SVG code, created in October 2026 specifically for Honeywood.
- Built only from basic shapes, simple paths and gradients. There are no filters, photographs, clip art, fonts or generated images.
- Uses Honeywood's colours: cream, powder blue, sage, butter and honey, warm ink outlines (`#5B4B3F`), plus soft earth tones for bark, stones and fur.
- Painterly feel: soft gradients, translucent washes over the sky, grass and leaves, and lighter outlines than the file icons.
- Nothing was traced, downloaded or adapted from existing artwork, and no third-party assets are included.

## The four friends

They're original Honeywood characters. Each was designed with its own animal type, silhouette, colours and accessory, so that none resembles an existing character.

| Friend | Animal | Distinguishing design |
|---|---|---|
| **Bramble** | Bear cub | Toasted-caramel fur, a cream belly patch and paw pads, and a sage-green knitted scarf with honey stripes. Front-facing and seated. |
| **Willow** | Hare | Grey-lavender fur, tall ears with one tip folded forward, a white chest and tail, and a sprig of heather behind one ear. Shown in three-quarter view. |
| **Pip** | Dormouse | Rosy-brown fur, very large round ears, a long curled tail and an acorn-cup hat. Sits on a mossy stone holding a daisy. |
| **Tansy** | Wildcat kitten | Tawny-grey tabby fur with soft brown markings, olive-green eyes, and a thick, blunt, ringed tail with a dark tip, curled to one side. |

None of them wears or carries anything associated with existing children's characters. That means:

- no shirts, jumpers, bows or tail ribbons;
- no honey pots with lettering;
- no bouncing or stretched poses.

The group sits on a riverbank beside a mossy stone and a little leaf of honeycomb. It isn't a reproduction of any existing group picture.

## Animated layers

Parts of the scene carry `hw-` class names. The Storybook view animates them with CSS; the SVG file itself contains no styles or scripts.

| Layer | Movement |
|---|---|
| `hw-bee-1` to `hw-bee-3` | Slow loops around the hive; one visits the flowers |
| `hw-flow`, `hw-glint`, `hw-ripple` | Flowing highlights, sparkles and ripples on the river |
| `hw-sway`, `hw-canopy` | Daisies, reeds, grass and the oak's leaves swaying gently |
| `hw-breathe`, `hw-blink` | Each friend breathing and blinking, on its own rhythm |
| `hw-head`, `hw-willow-ear`, `hw-tansy-tail`, `hw-pip-tail` | An occasional head tilt, ear twitch or tail swish |
| `hw-cloud`, `hw-sunglow` | Clouds drifting and the sun glowing |
| `hw-butterfly`, `hw-bird` | A butterfly and a bird that pass by now and then |

Opened on its own, outside the view, the file shows the same scene standing still, with the friends' eyes open.

## Licence

It's Honeywood artwork in the `images/` folder, so `ARTWORK-LICENSE.md` covers it: all rights reserved, with the permissions listed there. It is **not** covered by the MIT License.

## Checks

`npm test` (`scripts/test-storybook.mjs`) checks that the scene:

- contains no scripts, styles, links, embedded images or external references;
- labels every friend and animated layer as expected;
- keeps animated layers free of `transform` attributes;
- has open eyes when shown standing still;
- still carries its provenance comment.
