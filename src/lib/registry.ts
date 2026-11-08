// The site's one source of truth: the crates it presents, the commit each is pinned to, and
// the demos built from those commits. Read by the pages and by scripts/demos.ts, which
// checks out every pinned commit, copies the images named here and builds the demos.
//
// Bumping a crate: change `pin` (tag and the commit it points at). The build checks the
// checkout really is that commit, and rebuilds that crate's demos.
//
// Plain Node runs this file too (scripts, tests), so it stays free of $app / Svelte imports.

/** The release of a crate's repository the site shows. */
export interface Pin {
	/** The release tag the commit carries, shown as the version. */
	tag: string;
	/** Full 40-hex commit SHA; the build verifies the checkout against it. */
	commit: string;
}

/** An image from a crate's repository, read at the pinned commit. */
export interface Media {
	/** Path inside the repository. */
	path: string;
	alt: string;
	caption?: string;
	/** Pins an image fetched from GitHub at a tag (a release demo's poster): tags can move. */
	sha256?: string;
}

export interface Project {
	slug: string;
	/** The crate's name on crates.io. */
	crate: string;
	/** `owner/name` on GitHub. */
	repo: string;
	/** Short display name ("dosvideo"). */
	name: string;
	/** `core` is game-toolkit itself; `addon` builds on it. */
	role: 'core' | 'addon';
	/** Unreleased crates have no pin yet: a page, no links, no demos. */
	status: 'released' | 'preview' | 'in-development';
	tagline: string;
	summary: string;
	/** Colour this crate is painted in across the site (cards, demo frames, page accent). */
	accent: string;
	pin?: Pin;
	license: string;
	/** `Cargo.toml` lines that add it. */
	install: string;
	/** A first program, Rust, highlighted at build time. */
	example?: string;
	highlights: { title: string; text: string }[];
	gallery?: Media[];
	/** On crates.io (and so on docs.rs). */
	published: boolean;
}

export interface Demo {
	slug: string;
	project: string;
	title: string;
	blurb: string;
	/** Cargo package and the binary or example in it to build for wasm32 from the project's pin. */
	build?: { package: string; bin?: string; example?: string; features?: string[] };
	/**
	 * Or a game's own web build: the zip attached to a GitHub release, pinned by SHA-256 and
	 * checked against the repository's build-provenance attestation. `module` is its
	 * wasm-bindgen JS file. The poster is read from `repo` at `tag`.
	 */
	release?: { repo: string; tag: string; asset: string; sha256: string; module: string };
	/** The `<canvas id>` the program binds to; without one the toolkit appends its own. */
	canvas?: string;
	/** Asset folder in the repository, served as `assets/` next to the demo's page. */
	assets?: string;
	/** The demo's own screen, for the frame's aspect ratio. */
	size: [number, number];
	/**
	 * For a demo that scales its screen by whole numbers only: its native resolution. The
	 * player runs it at the next whole multiple that covers the frame and scales that down,
	 * so it fills the frame instead of sitting small in a black border.
	 */
	native?: [number, number];
	/** Click-to-run poster, from the repository; without one the frame shows the title. */
	poster?: Media;
	controls?: [keys: string, action: string][];
	/**
	 * Source files shown on the demo's guide page (/play/<slug>/), read from the pinned
	 * checkout at build time, so the guide is always the code that was built. Build demos
	 * only; a release demo is a whole game and links its repository instead.
	 */
	code?: string[];
	/** Said above the code when it is not the demo's own (the platformer's test bench). */
	codeNote?: string;
	/** Launch options, set as `data-*` attributes on the canvas (`{ cracktro: true }`). */
	options?: Record<string, string | boolean>;
	/** On the home page's demo strip. */
	featured?: boolean;
}

/** A demo as the pages get it from the prerender (src/lib/server/demos.ts). */
export interface DemoInfo extends Demo {
	/** Its build is in static/demos/ (always in production; a dev checkout may lack it). */
	built: boolean;
	/** Bytes of wasm the Run click downloads. */
	bytes?: number;
}

const GT = 'sunsided/game-toolkit';
const DOSVIDEO = 'sunsided/game-toolkit-dosvideo';
const PLATFORMER = 'sunsided/game-toolkit-platformer';

export const PROJECTS: Project[] = [
	{
		slug: 'game-toolkit',
		crate: 'game-toolkit',
		name: 'game-toolkit',
		role: 'core',
		status: 'released',
		tagline: 'Small, focused Rust crates for 2D and 3D game jams.',
		summary:
			'Implement `init`, `update` and `render`, and ship. A batched 2D painter (sprites, shapes, text, tilemaps, optional vello vectors) and instanced, depth-tested 3D meshes draw into the same frame, so a 3D scene gets a 2D HUD for free. Native and the browser from the same code.',
		accent: '#c6f24e',
		repo: GT,
		pin: { tag: 'v0.11.3', commit: '2d2be5bc08894695ce48f726677987760446c874' },
		license: 'EUPL-1.2',
		install: 'game-toolkit = "0.11"',
		example: `use game_toolkit::prelude::*;

struct Game1;

impl Game for Game1 {
    fn init(_ctx: &mut Context) -> Result<Self> {
        Ok(Self)
    }

    fn update(&mut self, ctx: &mut Context, _dt: f32) {
        if ctx.input.key_pressed(Key::Escape) {
            ctx.quit();
        }
    }

    fn render(&mut self, ctx: &mut Context, frame: &mut Frame) {
        let mut p = frame.painter(&mut ctx.gfx);
        p.clear([0.1, 0.1, 0.15, 1.0]);
        p.text([24.0, 24.0], "hello, jam", 28.0, [1.0, 1.0, 1.0, 1.0]);
    }
}

fn main() -> Result<()> {
    run::<Game1>(AppConfig {
        title: "my-jam".into(),
        width: 800,
        height: 600,
        ..Default::default()
    })
}`,
		highlights: [
			{
				title: 'One frame, 2D and 3D',
				text: 'Sprites, SDF shapes, glyphon text and atlas tilemaps through one `Painter`; instanced meshes with depth testing under it. Draw order is the order you call.'
			},
			{
				title: 'Browser from the same code',
				text: 'wgpu on WebGPU with a WebGL2 fallback, WebAudio, the Gamepad API and touch. Assets preload from a manifest so loading stays synchronous.'
			},
			{
				title: 'Sound that just works',
				text: 'kira playback that degrades to muted without a device, plus synthie chiptune music and effects behind the `synth` feature.'
			},
			{
				title: 'Pull only what you use',
				text: 'Core, gfx, input, audio, assets, Aseprite, ECS, egui overlays and GPU compute are separate crates behind one umbrella and its features.'
			},
			{
				title: 'Jam templates',
				text: '`cargo generate` a 2D or 3D starter with assets, a web build and an agent guide to the whole API already in place.'
			},
			{
				title: 'GPU compute',
				text: 'WGSL kernels over a grid, ping-pong storage buffers, a readback ring that never blocks, storage textures you draw like sprites, and a submitter that keeps simulations off the frame. Behind the `compute` feature.'
			},
			{
				title: 'Post and palettes',
				text: 'Virtual resolutions, a CRT filter, custom WGSL effects and indexed colour with palette cycling, for the retro look without fighting the GPU.'
			}
		],
		published: true
	},
	{
		slug: 'platformer',
		crate: 'game-toolkit-platformer',
		name: 'platformer',
		role: 'addon',
		status: 'released',
		tagline: 'A platforming controller that feels good, and the animation that shows it.',
		summary:
			'Fluid, snappy movement with presets tuned toward Celeste, Hollow Knight, Silksong and Super Meat Boy: jump buffer, coyote time, wall jumps, dashes, climbing, rolls. An animation state graph follows every decision without ever holding one up. Pick a preset, feed it input, draw what it tells you.',
		accent: '#ffa53d',
		repo: PLATFORMER,
		pin: { tag: 'v0.1.0', commit: '3f9eef2c029d0a0a0259dd4e1bec6cd839b2a8ed' },
		license: 'EUPL-1.2',
		install: `game-toolkit = "0.10"
game-toolkit-platformer = "0.1"`,
		example: `use game_toolkit::prelude::*;
use game_toolkit_platformer::prelude::*;

struct MyGame {
    level: Level,
    hero: Platformer,
}

impl Game for MyGame {
    fn init(_ctx: &mut Context) -> Result<Self> {
        let level = Level::demo();
        let hero = Platformer::on(&level, Preset::Precise);
        Ok(Self { level, hero })
    }

    fn update(&mut self, ctx: &mut Context, dt: f32) {
        self.hero.update(&ctx.input, &mut self.level, dt);
        for event in self.hero.drain_events() {
            if let Event::Landed { drop, .. } = event {
                if drop > 48 { /* a thud, some dust */ }
            }
        }
    }

    fn render(&mut self, ctx: &mut Context, frame: &mut Frame) {
        let mut p = frame.painter(&mut ctx.gfx);
        p.clear([0.05, 0.04, 0.12, 1.0]);
        self.level.draw_debug(&mut p, [0.0, 0.0], 3.0);
        self.hero.draw_debug(&mut p, [0.0, 0.0], 3.0);
    }
}`,
		highlights: [
			{
				title: 'Presets with a feel',
				text: '`Precise`, `Snappy`, `Drifter`, `Momentum` and `Hybrid`, each with its own control scheme for keyboard and gamepad. Then tune any number.'
			},
			{
				title: 'Forgiving where it counts',
				text: 'Jump buffer, coyote time, variable height, apex hangtime, corner correction and a heavier fall.'
			},
			{
				title: 'Every move',
				text: 'Double jumps, glides, 8-way dashes, dives, wall slides and stick-aimed wall jumps, climbing with stamina, rolls, a charged super dash.'
			},
			{
				title: 'Animation that keeps up',
				text: 'A state graph that follows the movement and never delays it. Layers you can tune, replace or use on their own.'
			}
		],
		gallery: [
			{
				path: 'docs/art/super-dash.png',
				alt: 'Super dash across the floor, ending in a bonk',
				caption: 'A charged super dash, ending in a bonk'
			},
			{
				path: 'docs/art/glide.png',
				alt: 'Glide after the double jump, drifter preset',
				caption: 'Drifter: a glide after the double jump'
			},
			{
				path: 'docs/art/chimney-bounce.png',
				alt: 'Bouncing up a narrow chimney with wall jumps',
				caption: 'Wall jumps up a narrow chimney'
			},
			{
				path: 'docs/art/push-pull.png',
				alt: 'Pushing, holding and pulling a box',
				caption: 'Ability hooks: push, hold and pull a box'
			}
		],
		published: true
	},
	{
		slug: 'dosvideo',
		crate: 'game-toolkit-dosvideo',
		name: 'dosvideo',
		role: 'addon',
		status: 'released',
		tagline: 'DOS-era PC video, emulated at the register level, with a beam-accurate CRT.',
		summary:
			'VGA (mode 13h, Mode X, 16-colour planar, text), EGA, CGA with composite artifact colours and snow, Hercules, Tandy 1000 and VESA SVGA. Your game is ordinary Rust; what is emulated is the display adapter, its memory, its registers, its timing and the electron beam reading it out while you write.',
		accent: '#ff4fd8',
		repo: DOSVIDEO,
		pin: { tag: 'v0.2.2', commit: '3ce1beb46c20199a15ad88f5da53dcd2dfd9d0bc' },
		license: 'EUPL-1.2',
		install: 'game-toolkit-dosvideo = "0.2"',
		example: `use game_toolkit_dosvideo::prelude::*;

struct Hello;

impl DosGame for Hello {
    fn init(dos: &mut Dos) -> anyhow::Result<Self> {
        dos.set_mode(0x13); // INT 10h, AX=0013h
        Ok(Self)
    }

    fn step(&mut self, dos: &mut Dos) {
        // while (inp(0x3DA) & 8); while (!(inp(0x3DA) & 8));
        dos.wait_vretrace();
        dos.set_palette(1, [63, 0, 0]); // OUT 3C8h / 3C9h
        dos.fill(0xA0000 + 100 * 320, 320, 1); // a red line in A000:7D00
        if dos.key(sc::ESC) {
            dos.exit();
        }
    }
}

fn main() -> anyhow::Result<()> {
    run::<Hello>(DosConfig::new("hello", Adapter::Vga))
}`,
		highlights: [
			{
				title: 'Six adapters',
				text: 'VGA, EGA, CGA, Hercules, Tandy 1000 and VESA SVGA (VBE 1.2 and 2.0), each with its own memory layout, BIOS modes and quirks.'
			},
			{
				title: 'A clock, a bus and a beam',
				text: 'Writes land while the beam scans. Raster bars, split screens and tearing happen for the same reasons they did in 1992.'
			},
			{
				title: 'Ports or helpers',
				text: 'Program it through `OUT 3C8h` and pokes into `A000:0000`, or through helpers that do the same thing with less typing.'
			},
			{
				title: 'Looking like a CRT',
				text: 'VGA monitor, TV, green and amber phosphor presets, composite artifact colours and CGA snow.'
			},
			{
				title: 'The PC speaker',
				text: 'One square wave, no volume control, and all the tricks: PWM samples and synthie tracker songs on a single channel.'
			}
		],
		gallery: [
			{
				path: 'docs/text_mode_galactic.jpg',
				alt: 'VGA text mode with the Standard Galactic Alphabet in the character generator, through the VGA monitor CRT filter',
				caption: 'text_mode: the Standard Galactic Alphabet loaded into the character generator'
			},
			{
				path: 'docs/cga_composite.jpg',
				alt: 'The 16 CGA composite artifact colours as vertical bands',
				caption: 'cga_showcase: 640×200 black-and-white patterns turned into composite colour'
			},
			{
				path: 'docs/hercules_text.jpg',
				alt: 'MDA text attributes on an amber screen',
				caption: 'hercules: MDA text attributes and the 9th-column rule'
			},
			{
				path: 'docs/svga_hicolor.png',
				alt: 'A 65536-colour gradient with a plasma window',
				caption: 'svga: VBE 640×480 in 65536 colours'
			}
		],
		published: true
	},
	{
		slug: 'dosaudio',
		crate: 'game-toolkit-dosaudio',
		name: 'dosaudio',
		role: 'addon',
		status: 'released',
		tagline: 'DOS-era PC sound devices on a shared hardware timeline.',
		summary:
			'PC speaker, AdLib OPL2, dual OPL2 and OPL3 behind their real I/O ports, sharing one hardware clock with dosvideo. Interchangeable OPL cores, IMF and DRO playback, register capture and deterministic WAV rendering. The audio thread synthesizes without allocating or locking.',
		accent: '#ffd23f',
		repo: 'sunsided/game-toolkit-dosaudio',
		pin: { tag: 'v0.1.1', commit: 'a7a9ac84986aeebc6960ee46f24227b2c370d0c7' },
		license: 'EUPL-1.2 OR MIT OR Apache-2.0',
		install: 'game-toolkit-dosaudio = "0.1"',
		example: `use game_toolkit_dosaudio::prelude::*;
use std::time::Duration;

let mut machine = OfflineMachine::new(SoundConfig::none().speaker(true), 48_000)?;
machine.sound(440.0)?;
machine.render_for(Duration::from_millis(100))?;
machine.nosound()?;
machine.render_for(Duration::from_millis(20))?;
std::fs::write("beep.wav", machine.finish().to_bytes()?)?;`,
		highlights: [
			{
				title: 'Port-level hardware',
				text: 'Detect the AdLib the way 1990 did: start an OPL timer through 388h, wait, read the status back.'
			},
			{
				title: 'One clock, two halves',
				text: 'The game thread owns timers, latches and port reads; the audio thread owns synthesis. A bounded queue of timestamped changes joins them.'
			},
			{
				title: 'IMF and DRO',
				text: 'Play the formats DOS games and DOSBox captures used, looped or once, on OPL2, dual OPL2 or OPL3.'
			},
			{
				title: 'Offline, deterministic',
				text: 'Render to WAV without an audio device, sample for sample the same as live playback.'
			}
		],
		published: true
	}
];

export const DEMOS: Demo[] = [
	{
		slug: 'copper-bars',
		project: 'dosvideo',
		title: 'Copper bars',
		blurb:
			'Mode 13h raster bars: every scanline rewrites one DAC entry while the beam passes, under a sine scroller.',
		build: { package: 'game-toolkit-dosvideo', example: 'copper_bars' },
		code: ['crates/dosvideo/examples/copper_bars.rs'],
		size: [4, 3],
		poster: {
			path: 'docs/copper_bars.jpg',
			alt: 'Rainbow logo over raster bars, mountains and a scrolling floor'
		}
	},
	{
		slug: 'palette-cycling',
		project: 'dosvideo',
		title: 'Palette cycling',
		blurb:
			'Water, ripples and sun glow move without touching a pixel: the picture holds indices, the DAC rotates.',
		build: { package: 'game-toolkit-dosvideo', example: 'palette_cycling' },
		code: ['crates/dosvideo/examples/palette_cycling.rs'],
		size: [4, 3],
		poster: {
			path: 'docs/palette_cycling.png',
			alt: 'A sunset landscape with a waterfall'
		}
	},
	{
		slug: 'modex-scroll',
		project: 'dosvideo',
		title: 'Mode X scrolling',
		blurb:
			'320×240, a virtual screen wider than the display, a split-screen status bar and page-flipped sprites.',
		build: { package: 'game-toolkit-dosvideo', example: 'modex_scroll' },
		code: ['crates/dosvideo/examples/modex_scroll.rs'],
		size: [4, 3],
		poster: {
			path: 'docs/modex_scroll.png',
			alt: 'A hardware-scrolled landscape with balls and a status bar'
		}
	},
	{
		slug: 'tearing-lab',
		project: 'dosvideo',
		title: 'Tearing lab',
		blurb:
			'A full-frame copy on a 16-bit ISA bus, overtaken by the beam: why DOS games tore, and what fixed it.',
		build: { package: 'game-toolkit-dosvideo', example: 'tearing_lab' },
		code: ['crates/dosvideo/examples/tearing_lab.rs'],
		size: [4, 3],
		poster: {
			path: 'docs/tearing_lab.png',
			alt: 'Moving bars torn where the copy was overtaken by the beam'
		}
	},
	{
		slug: 'ega-scroller',
		project: 'dosvideo',
		title: 'EGA scroller',
		blurb: 'Smooth scrolling in 16 colours with pel panning and latch tile copies.',
		build: { package: 'game-toolkit-dosvideo', example: 'ega_scroller' },
		code: ['crates/dosvideo/examples/ega_scroller.rs'],
		size: [4, 3],
		poster: { path: 'docs/ega_scroller.jpg', alt: 'A side-scroller level in 16 EGA colours' }
	},
	{
		slug: 'hercules',
		project: 'dosvideo',
		title: 'Hercules',
		blurb: '720×348 monochrome: drawn on the hidden page, flipped in vertical retrace.',
		build: { package: 'game-toolkit-dosvideo', example: 'hercules' },
		code: ['crates/dosvideo/examples/hercules.rs'],
		size: [4, 3],
		poster: { path: 'docs/hercules.jpg', alt: 'Rotating wireframes on a Hercules card' }
	},
	{
		slug: 'pc-speaker',
		project: 'dosvideo',
		title: 'PC speaker',
		blurb: 'A text-mode piano, tracker music on one square wave and PWM samples.',
		build: { package: 'game-toolkit-dosvideo', example: 'pc_speaker', features: ['synth'] },
		code: ['crates/dosvideo/examples/pc_speaker.rs'],
		size: [4, 3],
		poster: { path: 'docs/pc_speaker.png', alt: 'A text-mode piano and pitch history' },
		controls: [
			['A–K', 'white keys'],
			['W E T Y U', 'black keys']
		]
	},
	{
		slug: 'platformer',
		project: 'platformer',
		title: 'Moonlit level',
		blurb:
			'The test bench: the Cheesed heroine in a moonlit level, every move and every preset, with a debug overlay.',
		build: { package: 'platformer-demo', bin: 'platformer-demo' },
		code: ['examples/minimal.rs'],
		codeNote:
			'The demo is the crate’s full test bench. This is `examples/minimal.rs`: the same controller, a playable character, in one file.',
		canvas: 'animation',
		native: [384, 216],
		size: [16, 9],
		poster: {
			path: 'docs/art/wall-scale.png',
			alt: 'Scaling a single wall with stick-aimed wall jumps'
		},
		controls: [
			['Arrows', 'move'],
			['F2', 'cycle presets'],
			['Gamepad', 'supported']
		],
		featured: true
	},
	{
		slug: 'cookie-doh',
		project: 'game-toolkit',
		title: "Cookie D'oh!",
		blurb:
			'A C64/Amiga-era arcade game about accepting every cookie the Internet throws at you. A complete game on the toolkit, native and web from the same code.',
		release: {
			repo: 'sunsided/cookie-doh',
			tag: 'v0.2.2',
			asset: 'cookie-doh-v0.2.2-web.zip',
			sha256: '2e7febeeb3d3ff158761c346610c28b19ff0125da19fe4a0e1a70368f1795808',
			module: 'cookie-doh.js'
		},
		canvas: 'cookie-doh',
		options: { cracktro: true },
		size: [16, 10],
		native: [320, 200],
		poster: {
			path: 'docs/screenshots/title.png',
			sha256: '1fca921820532768fa3a8059fd5756826ce544004beeb0a34fc779cb21a629c6',
			alt: "Cookie D'oh! title screen: a marquee reading Accept All Cookies over a cookie conveyor, with a cookie consent banner offering Accept All and a greyed-out Reject."
		},
		controls: [
			['Keyboard', 'play'],
			['Gamepad / touch', 'supported']
		]
	},
	{
		slug: 'cheesed',
		project: 'game-toolkit',
		title: 'Cheesed!',
		blurb:
			'A complete game on the toolkit: a thrilling action adventure in DOS-era dress, with procedural music from title-screen metal to a music-box minuet. The Mouse. The Cheese. The Destiny.',
		release: {
			repo: 'sunsided/cheesed',
			tag: 'v0.1.2',
			asset: 'cheesed-v0.1.2-web.zip',
			sha256: '8b0240e10dea516ee1f059a6a6d739f843c45b830a39b43de46643988eda8797',
			module: 'cheese.js'
		},
		canvas: 'cheese',
		size: [16, 10],
		native: [320, 200],
		poster: {
			path: 'docs/screenshots/title.png',
			sha256: 'fdfe4bdcd01178a72c8b8efd045f46300cef91cf241595644f5064dc98beba57',
			alt: 'Cheesed! title painting: a caped mouse holds a glowing cheese aloft on a crag, a huge cat lunging behind her and a castle under lightning in the distance.'
		},
		featured: true
	},
	{
		slug: 'elite-galaxies',
		project: 'game-toolkit',
		title: 'Elite galaxies',
		blurb:
			'The galaxy generator of Elite (1984) rebuilt in Rust, faithful to the 6502 original: eight galaxies of 256 systems from three 16-bit seeds, flown through in a 320×200 explorer drawn on the CPU.',
		release: {
			repo: 'sunsided/elite-galaxies',
			tag: 'v0.1.0',
			asset: 'elite-explorer-v0.1.0-web.zip',
			sha256: 'b4b0949c5696e7391637108d19a6e6cca4ea5f2b9a579ea48fbdcc90606da928',
			module: 'explorer.js'
		},
		size: [16, 10],
		native: [320, 200],
		poster: {
			path: 'docs/screenshot.png',
			sha256: 'c08d433e059fd1205997d1281e2416ec43a1d52b4e7a438def06f18b56e1f127',
			alt: 'Lave in the explorer: a green and blue planet with ice caps, and its data sheet: Rich Agricultural, Dictatorship, Human Colonials, famous for its vast rain forests and the Lavian tree grub.'
		},
		controls: [
			['← →', 'previous / next system'],
			['↑ ↓', 'galactic hyperdrive'],
			['Tab', 'galactic chart'],
			['Space', 'pause rotation']
		]
	},
	{
		slug: 'rust-racer',
		project: 'game-toolkit',
		title: 'Rust Racer',
		blurb:
			'An OutRun-style pseudo-3D racer, a port of Jake Gordon’s javascript-racer onto the toolkit, with the simulation running in a [sillyecs](https://github.com/sunsided/sillyecs) world: traffic, collisions, lap times and parallax as systems.',
		release: {
			repo: 'sunsided/rust-racer',
			tag: 'v0.3.1',
			asset: 'rust-racer-v0.3.1-web.zip',
			sha256: '4ac357e82ab96648db0f9e694c39a27b1e55f1e5451317325d288fe0a45aff54',
			module: 'rust-racer.js'
		},
		canvas: 'game',
		size: [4, 3],
		poster: {
			path: 'docs/screenshot.png',
			sha256: '9dfe8df752f34037d8247534c3a891de22336191e62e27bb1da0b9c4fbfb2872',
			alt: 'Driving through a curve past billboards, with traffic ahead'
		},
		controls: [
			['Arrows / WASD', 'drive'],
			['Gamepad', 'supported'],
			['M', 'music on/off']
		]
	},
	{
		slug: 'hello-web',
		project: 'game-toolkit',
		title: 'Hello, web',
		blurb:
			'The same code natively and in the browser: a sprite, text, a sound on click, looping synth music and the first gamepad.',
		build: { package: 'ex_13_web', bin: '13_web' },
		code: ['examples/13_web/src/main.rs'],
		assets: 'examples/13_web/assets',
		canvas: 'game',
		size: [16, 9],
		controls: [
			['Click / Space', 'sound'],
			['M', 'music on/off'],
			['Gamepad', 'left stick']
		]
	},
	{
		slug: 'cubes-3d',
		project: 'game-toolkit',
		title: '3D with a HUD',
		blurb:
			'Three depth-tested cubes under a perspective camera, a 2D HUD drawn into the same frame.',
		build: { package: 'ex_07_3d', bin: '07_3d' },
		code: ['examples/07_3d/src/main.rs'],
		size: [3, 2]
	},
	{
		slug: 'palette',
		project: 'game-toolkit',
		title: 'Indexed colour',
		blurb:
			'Everything drawn with palette indices on a 160×120 canvas; a waterfall cycles and day crossfades into night.',
		build: { package: 'ex_19_palette', bin: '19_palette' },
		code: ['examples/19_palette/src/main.rs'],
		size: [4, 3],
		controls: [['Space', 'day ↔ night']]
	},
	{
		slug: 'life',
		project: 'game-toolkit',
		title: 'Game of Life on the GPU',
		blurb:
			'A compute kernel steps the grid in ping-pong buffers and paints a storage texture; a readback ring counts the cells without ever waiting. Needs WebGPU: on WebGL2 it says so.',
		build: { package: 'ex_16_compute', bin: '16_compute' },
		code: ['examples/16_compute/src/main.rs', 'examples/16_compute/src/life.wgsl'],
		size: [16, 10],
		controls: [
			['Mouse', 'draw cells'],
			['R / C', 'reseed / clear'],
			['Space', 'pause']
		]
	},
	{
		slug: 'touch',
		project: 'game-toolkit',
		title: 'Touch',
		blurb:
			'Every finger as a ring with a line back to where it went down. Try it on a phone; the mouse works too.',
		build: { package: 'ex_15_touch', bin: '15_touch' },
		code: ['examples/15_touch/src/main.rs'],
		canvas: 'game',
		size: [16, 9]
	}
];

/**
 * Related crates by the same author, outside the toolkit: a line each on the home page, with
 * GitHub and crates.io links. No pages, pins or demos; `try` links a version to use online.
 */
export interface Mention {
	/** The crate's name on crates.io. */
	crate: string;
	repo: string;
	tagline: string;
	try?: string;
}

export const MENTIONS: Mention[] = [
	{
		crate: 'sillyecs',
		repo: 'sunsided/sillyecs',
		tagline:
			'A zero-overhead archetype ECS, generated and scheduled at compile time from a YAML schema. The toolkit’s `ecs` feature builds on it.'
	},
	{
		crate: 'dramaturge',
		repo: 'sunsided/dramaturge',
		tagline:
			'Branching dialogue, character memory and narrative state, as pure data for any engine: facts, conditions, memories and consequences.'
	},
	{
		crate: 'loremaster',
		repo: 'sunsided/loremaster',
		tagline:
			'A runtime for interactive fiction and graphical adventures on dramaturge, with live editing and playtesting: every text comes from the world state, and you see when it shows and why.',
		try: 'https://sunsided.github.io/loremaster/'
	}
];

// --- Lookups and invariants -----------------------------------------------------------------

const SLUG = /^[a-z0-9][a-z0-9-]*$/;
const COMMIT = /^[0-9a-f]{40}$/;
const REPO = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
// A cargo package, binary or example name, a feature, or a repo-relative path without `..`.
const NAME = /^[A-Za-z0-9_-]+$/;
const PATH = /^(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]+$/;

export function project(slug: string): Project {
	const p = PROJECTS.find((p) => p.slug === slug);
	if (!p) throw new Error(`no project "${slug}"`);
	return p;
}

export function demosOf(slug: string): Demo[] {
	return DEMOS.filter((d) => d.project === slug);
}

/** A project's demos only count once it has a pin to build them from. */
export function buildable(d: Demo): boolean {
	return !!d.release || !!project(d.project).pin;
}

/** The demo's wasm-bindgen module and wasm file in its folder. */
export function demoFiles(d: Demo) {
	const module = d.release?.module ?? 'demo.js';
	return { module, wasm: module.replace(/\.js$/, '_bg.wasm') };
}

/**
 * The registry's invariants. Its values end up in shell-free `execFile` arguments and in file
 * paths under static/, so slugs, names and paths are held to tight shapes here, and the
 * test suite runs this. Returns every problem, not the first.
 */
export function problems(): string[] {
	const out: string[] = [];
	const seen = new Set<string>();
	for (const p of PROJECTS) {
		if (!SLUG.test(p.slug)) out.push(`project slug "${p.slug}"`);
		if (seen.has(p.slug)) out.push(`duplicate project "${p.slug}"`);
		seen.add(p.slug);
		if (!REPO.test(p.repo)) out.push(`${p.slug}: repo "${p.repo}"`);
		if (p.pin) {
			if (!COMMIT.test(p.pin.commit)) out.push(`${p.slug}: commit "${p.pin.commit}"`);
		}
		for (const m of p.gallery ?? []) if (!PATH.test(m.path)) out.push(`${p.slug}: ${m.path}`);
	}
	for (const m of MENTIONS) {
		if (!NAME.test(m.crate)) out.push(`mention "${m.crate}"`);
		if (!REPO.test(m.repo)) out.push(`${m.crate}: repo "${m.repo}"`);
		if (m.try && !m.try.startsWith('https://')) out.push(`${m.crate}: try "${m.try}"`);
	}
	const demos = new Set<string>();
	for (const d of DEMOS) {
		if (!SLUG.test(d.slug)) out.push(`demo slug "${d.slug}"`);
		if (demos.has(d.slug)) out.push(`duplicate demo "${d.slug}"`);
		demos.add(d.slug);
		if (!seen.has(d.project)) out.push(`${d.slug}: unknown project "${d.project}"`);
		if (!d.build === !d.release) out.push(`${d.slug}: needs exactly one of build and release`);
		const { package: pkg = 'x', bin, example, features = [] } = d.build ?? {};
		if (bin && example) out.push(`${d.slug}: bin and example`);
		if (d.release) {
			const r = d.release;
			if (!REPO.test(r.repo)) out.push(`${d.slug}: repo "${r.repo}"`);
			if (!/^[\w.+-]+$/.test(r.tag)) out.push(`${d.slug}: tag "${r.tag}"`);
			if (!/^[\w.+-]+\.zip$/.test(r.asset)) out.push(`${d.slug}: asset "${r.asset}"`);
			if (!/^[0-9a-f]{64}$/.test(r.sha256)) out.push(`${d.slug}: sha256 "${r.sha256}"`);
			if (!/^[\w-]+\.js$/.test(r.module)) out.push(`${d.slug}: module "${r.module}"`);
			if (d.poster && !/^[0-9a-f]{64}$/.test(d.poster.sha256 ?? ''))
				out.push(`${d.slug}: a release demo's poster needs its sha256`);
		}
		for (const n of [pkg, bin, example, ...features])
			if (n !== undefined && !NAME.test(n)) out.push(`${d.slug}: name "${n}"`);
		if (d.code && !d.build) out.push(`${d.slug}: code needs a build demo`);
		for (const path of d.code ?? []) if (!PATH.test(path)) out.push(`${d.slug}: code "${path}"`);
		for (const [k, v] of Object.entries(d.options ?? {}))
			if (!/^[a-z][a-z0-9-]*$/.test(k) || (typeof v === 'string' && !/^[\w .,-]*$/.test(v)))
				out.push(`${d.slug}: option "${k}"`);
		for (const path of [d.assets, d.poster?.path])
			if (path !== undefined && !PATH.test(path)) out.push(`${d.slug}: path "${path}"`);
	}
	return out;
}

// --- URLs ------------------------------------------------------------------------------------

/** Where an image from a project's repository is served, below static/. */
export function mediaPath(projectSlug: string, path: string) {
	return `media/${projectSlug}/${path.split('/').at(-1)}`;
}

/**
 * Where a demo's poster is served. A release demo's comes from its own repository, so it
 * gets its own folder: two games may both call theirs docs/screenshots/title.png.
 */
export function posterPath(d: Demo): string | undefined {
	if (!d.poster) return undefined;
	return mediaPath(d.release ? d.slug : d.project, d.poster.path);
}

/** The folder below .cache/src/ a project's pinned commit is checked out into. */
export function checkoutName(p: Project & { pin: Pin }) {
	return `${p.slug}-${p.pin.commit}`;
}

/** How to run a build demo yourself, from a checkout of its repository. */
export function runCommand(d: Demo): string | undefined {
	if (!d.build) return undefined;
	const { package: pkg, bin, example, features = [] } = d.build;
	return [
		'cargo run --release',
		`-p ${pkg}`,
		bin && `--bin ${bin}`,
		example && `--example ${example}`,
		features.length && `--features ${features.join(',')}`
	]
		.filter(Boolean)
		.join(' ');
}

/** The repository a demo is built from, at the release it is pinned to. */
export function source(d: Demo): { repo: string; tag: string; url: string } | undefined {
	const p = project(d.project);
	const at = d.release ?? (p.pin && { repo: p.repo, tag: p.pin.tag });
	return at && { repo: at.repo, tag: at.tag, url: `https://github.com/${at.repo}/tree/${at.tag}` };
}

export function demoPath(d: Demo) {
	return `demos/${d.slug}/`;
}

export function links(p: Project) {
	return {
		github: `https://github.com/${p.repo}`,
		crates: p.published ? `https://crates.io/crates/${p.crate}` : undefined,
		docs: p.published ? `https://docs.rs/${p.crate}` : undefined
	};
}
