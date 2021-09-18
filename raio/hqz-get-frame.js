/**
 * @author Guilherme Zaluchi <desenv@guilherme.zaluchi.com.br>
 * @version 1.0.1
 * @copyrights All lefts shared. Please copy it.
 */

const	_0_180 = [ 0, 180 ],
		_0_360 = [ 0, 360 ],
		// _600_720 = [ 600, 720 ],
		/** @type { HQZJsonConfig_Material[] } */
		materials = [
			[ [ 0.9, "d" ], [ 0, "t" ], [ 0.1, "r" ] ],
			[ [ 0.9, "d" ], [ 0.05, "t" ], [ 0.05, "r" ] ],
			[ [ 0.05, "d" ], [ 0.9, "t" ], [ 0.05, "r" ] ]
		],
		DEFS = { resolution: [1280, 720], exposure: 0.1, timelimit: 120, rays: 1e6 };

/** @type { HQZJsonConfig_Light } */
const Skylight = (w, h) => [
	// Relative light power
	100,
	// Cartesian Coords X, Y
	w / 2, - h / 2,
	// Polar Angle & Distance / Ray angle
	_0_180, [ h >> 2, h >> 1 ], _0_180,
	// Wavelength
	// [ 480, 560 ]
	// Black-body irradiation Kelvin
	[4100, "K"]
];

/**
 * @param { number } w	- The width (in cells)
 * @param { number } h	- The height (in cells)
 * @param { Object } defs
 * @param { [number, number] } [defs.resolution = [1280, 720]]
 * @param { number } [defs.exposure = 0.2]
 * @param { number } [defs.timelimit = 120]
 * @param { number } [a = 0]		- The seed
 * @param { Wall[] } [walls = []]	- The walls
 * @param { number } [lightningPower = 100]	- The relative light power of each lightning
 * @returns { lightning_func }
 */
function lightning(
	w, h,
	defs = DEFS,
	a = 0, walls = [], lightningPower = 100
){
	const obj = {
		...defs,
		materials,
		viewport: [0, 0, w, h]
	};
	
	return function lightning_func(frame, lightnings = []){
		const lightnings_lights = lightnings.map(l => [
			// Power
			lightningPower,
			// X, Y
			l.x + .5, l.y + .5,
			// téta, rô, ângulo de abertura
			_0_360, .5, _0_360,
			// Temperatura
			[2800, "K"]
		]);
		return {
			...obj,
			lights: [ Skylight(w, h), ...lightnings_lights ],
			objects: [
				// Material, x, y, dx, dy
				// Floor
				[ 0, 0, h, w, 0 ],
				...walls,
				...lightnings.map(l => {
					l.y = h - l.y;
					return [
						[ 2, l.x,		l.y,		1,		0 ],
						[ 2, l.x + 1,	l.y,		0,		- 1 ],
						[ 2, l.x + 1,	l.y - 1,	- 1,	0 ],
						[ 2, l.x,		l.y - 1,	0,		1 ]
					];
				}).flat()
			],
			seed: a + frame
		};
	};
}

/**
 * @param { number } w	- The width (in cells)
 * @param { number } h	- The height (in cells)
 * @param { Object } defs
 * @param { [number, number] } [defs.resolution = [1280, 720]]
 * @param { number } [defs.exposure = 0.2]
 * @param { number } [defs.timelimit = 120]
 * @param { number } [a = 0]		- The seed
 * @param { Wall[] } [walls = []]	- The walls
 * @param { number } [cellPower = 40]	- The relative light power of each cell
 * @param { number } [cellDelta = 3]	- How many cell layers shall be lit
 * @returns { search_func }
 */
function search(
	w, h,
	defs = DEFS,
	a = 0, walls = [], cellPower = 40, cellDelta = 3
){
	const obj = {
		...defs,
		materials,
		viewport: [0, 0, w, h]
	};
	
	return function search_func(frame, cells = []){
		cells = cells.filter(cell => cell.isActive);
		const lowestCellPoint = cells.reduce((r, { height: ch }) => Math.max(r, ch), 0);
		const cellLights = cells
			.filter(cell => lowestCellPoint - cell.height <= cellDelta)
			.map(cell => [
				// Power
				cellPower * (1 - (lowestCellPoint - cell.height) / cellDelta),
				// X, Y
				cell.x + .5, cell.y + .5,
				// téta, rô, ângulo do raio
				_0_360, 0.25, _0_360,
				[ 2700, "K" ]
			]);
		
		return {
			...obj,
			lights: [ Skylight(w, h), ...cellLights ],
			objects: [
				// Material, x, y, dx, dy
				// Floor
				[ 0, 0, h, w, 0 ],
				...walls
			],
			seed: a + frame
		};
	};
}

try{module.exports = { search, lightning };}catch(e){}
try{window.search = search, window.lightning = lightning;}catch(e){}

/**
 * @callback lightning_func
 * @param { number } frame			- The frame number
 * @param { Lightning[] } [lightnings = []]	- The lighnings
 * @returns { HQZJsonConfig }
 */

/**
 * @callback search_func
 * @param { number } frame			- The frame number
 * @param { Cell[] } [cells = []]	- The cells
 * @returns { HQZJsonConfig }
 */

/**
 * @typedef HQZJsonConfig
 * @property { ![ number, number ] } resolution	- In pixels
 * @property { ![ number, number, number, number ] } viewport
 * @property { !HQZJsonConfig_Light[] } lights
 * @property { !HQZJsonConfig_Object[] } objects
 * @property { !HQZJsonConfig_Material[] } materials
 * @property { !number } exposure	- Similar to the web version
 * @property { ?number } rays		- Number of rays
 * @property { ?number } timelimit	- In seconds
 * @property { ?number } [seed = 0]
 * @property { ?number } gamma
 */

/**
 * @typedef { [
 *  power: number,
 *  x: number,
 *  y: number,
 *  polarAngle: numbery,
 *  polarDistance: numbery,
 *  rayAngle: numbery,
 *  wavelength: numbery
 * ] } HQZJsonConfig_Light
 */

/**
 * @typedef { [
 *  material: number, x0: number, y0: number, dx: number, dy: number
 * ] | [
 *  material: number, x0: number, y0: number, a0: number, dx: number, dy: number, da: number
 * ] } HQZJsonConfig_Object
 */

/**
 * @typedef { [
 *  diffusion?: [ number, "d" ],
 *  transmissivity?: [ number, "t" ],
 *  reflectivity?: [ number, "r" ]
 * ] } HQZJsonConfig_Material
 */

/**
 * @typedef { number | [ number, number ] } numbery
 */

/**
 * @typedef Wall
 * @property { number } x0
 * @property { number } y0
 * @property { number } x1
 * @property { number } y1
 */

/**
 * @typedef Cell
 * @property { number } [height = - 1]
 * @property { boolean } [isActive = false]
 * @property { !number } x
 * @property { !number } y
 */

/**
 * @typedef Lightning
 * @property { !number } x
 * @property { !number } y
 */