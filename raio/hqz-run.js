/**
 * @author Guilherme Zaluchi <desenv@guilherme.zaluchi.com.br>
 * @version 1.0.1
 * @copyrights All lefts shared. Please copy it.
 */

// --- Configs ---
// The height & the width (in squares)
const	H = 64, W = 36;
// const	H = 24, W = 12;
// const	H = 16, W = 9;
// The seed
const	A = Math.trunc(1e9 * Math.random()),
		// The chance of a vertical line be formed
		chance_vertical = 0.45,
		// The chance of a horizontal line be formed
		chance_horizontal = 0.35,
		defs = {
			exposure: 0.15,
			resolution: [360, 640],
			// In seconds
			timelimit: 60,
			rays: 5e6
		},
		lightningLightPower = 10,
		cellLightPower = 4,
		OUTPUT_FOLDER = "./output/";
// --- End Configs ---

const	fs = require("fs"),
		getFrame = require("./hqz-get-frame");

if(!fs.existsSync(OUTPUT_FOLDER))
	fs.mkdirSync(OUTPUT_FOLDER);

function output(frame, data){
	fs.writeFileSync(OUTPUT_FOLDER + ("0000" + frame).slice(- 4) + ".json", JSON.stringify(data), "utf8");
}

/** @type { Painél[][] } */
var	painéis,
/** @type { Painél[] } */
	painéis_lista;

/**
 * A JS class representation of the walls of each square
 * @class Paredes
 */
class Paredes{
	// If left wall
	esquerda = false;
	// If top wall
	cima = false;
	// If right wall
	direita = false;
	// If bottom wall
	baixo = false;
	/**
	 * 
	 * @param { Painél } painél 
	 * @memberof Paredes
	 */
	constructor(painél){ this.painél = painél; }
}

/**
 * A JS class representation of each square
 * @class Painél
 */
class Painél{
	valor = - 1;
	/**
	 * Creates an instance of Painél.
	 * @param { number } x
	 * @param { number } y
	 * @memberof Painél
	 */
	constructor(x, y){
		/** @type { number } */
		this.x = x;
		/** @type { number } */
		this.y = y;
		this.paredes = new Paredes(this);
	}
	/**
	 * Generates the walls of the square
	 * @memberof Painél
	 */
	gerarParedes(){
		const { paredes, x, y } = this;
		if(x === 0)
			paredes.esquerda = true;
		// Gere parede esquerda
		else if(Math.random() < chance_horizontal / 2){
			paredes.esquerda = true;
			painéis[y][x - 1].paredes.direita = true;
		}
		if(x === W - 1)
			paredes.direita = true;
		// Gere parede direita
		else if(Math.random() < chance_horizontal / 2){
			paredes.direita = true;
			painéis[y][x + 1].paredes.esquerda = true;
		}
		if(y === 0)
			paredes.cima = false;
		else if(Math.random() < chance_vertical / 2){
			paredes.cima = true;
			painéis[y - 1][x].paredes.baixo = true;
		}
		if(y < H - 1 && Math.random() < chance_vertical / 2){
			paredes.baixo = true;
			painéis[y + 1][x].paredes.cima = true;
		}
	}
	/**
	 * Gets the accessible neighbouring squares
	 * @returns { Painél[] } Vizinhos
	 * @memberof Painél
	 */
	vizinhos(){
		const { x, y, paredes } = this;
		var ret = [];
		
		if(x > 0 && !paredes.esquerda){
			ret.push(painéis[y][x - 1]);
		}
		if(y > 0 && !paredes.cima){
			ret.push(painéis[y - 1][x]);
		}
		if(x < W - 1 && !paredes.direita){
			ret.push(painéis[y][x + 1]);
		}
		if(y < H - 1 && !paredes.baixo){
			ret.push(painéis[y + 1][x]);
		}
		
		return ret;
	}
	/**
	 * Returns the next neighbouring squares to be searched
	 * @returns { Painél[] }
	 */
	próximos(){
		const { x, y, paredes } = this;
		var ret = [], p;
		if(x > 0 && (p = painéis[y][x - 1]).valor === - 1 && !paredes.esquerda)
			ret.push(p);
		if(y > 0 && (p = painéis[y - 1][x]).valor === - 1 && !paredes.cima)
			ret.push(p);
		if(x < W - 1 && (p = painéis[y][x + 1]).valor === - 1 && !paredes.direita)
			ret.push(p);
		if(y < H - 1 && (p = painéis[y + 1][x]).valor === - 1 && !paredes.baixo)
			ret.push(p);
		
		return ret;
	}
}

/**
 * @yields { { paredes: number[][] } | { pos?: Coord[], melhor?: Coord } }
 */
function* calculateLightning(){
	painéis = Array.from(
		{ length: H },
		(_, i) => Array.from(
			{ length: W },
			(_, j) => new Painél(j, i)
		)
	);
	// console.log(painéis.map(linha => linha.map(painél => `${painél.x}x${painél.y}`)))
	
	painéis_lista = painéis.reduce((lista, linha) => lista.concat(linha), []);
	painéis_lista.forEach(painél => painél.gerarParedes());
	var i = 0;
	
		/** @type { Coord[] } */
	var	pos = painéis[0].map(painél => ({ x: painél.x, y: painél.y })),
		/** @type { Coord[] } */
		pos_n,
		/** @type { Coord } */
		p,
		/** @type { Painél[] } */
		próximos,
		/** @type { Coord } */
		melhor;
	
	
	yield {
		paredes: painéis_lista
			.map(painél => {
				const	{ x, y, paredes } = painél,
						/** @type { Wall[] } */
						ret = [];
				
				if(x === 0 || x === W - 1 || paredes.esquerda)
					ret.push({ x0: x, x1: x, y0: y, y1: y + 1 });
				if(paredes.cima)
					ret.push({ x0: x, x1: x + 1, y0: y, y1: y });
				
				return ret;
			})
			.flat(1)
			.map(wall => [ 1, wall.x0, wall.y0, wall.x1 - wall.x0, wall.y1 - wall.y0 ])
	};
	
	do{
		// console.log("Distância %d", i)
		yield null;
		i++;
		pos_n = [];
		// console.log(`Pos.length: ${pos.length}`)
		do{
			p = pos.shift();
			// console.log(painéis[0]);
			próximos = painéis[p.y][p.x].próximos();
			próximos.forEach(próximo => {
				próximo.valor = i;
				pos_n.push({ x: próximo.x, y: próximo.y });
			});
		}while(pos.length);
		// console.log(`\tPos_new.length: ${pos_n.length}`)
		if(!pos_n.length) break;
		pos = pos_n;
		melhor = pos.reduce((m, p) => p.y > m.y ? p : m);
	}while(melhor.y < H - 1);
	
	yield { pos, melhor };
}
/**
 *
 * @param { { painéis: Painél[][], pos: Coord[], melhor: Coord } } { painéis, pos, melhor }
 * @yields { { raios: Painél[] } }
 */
function* simulateLightning({ pos, melhor, painéis }){
	let pos_f = pos.filter(p => p.y === melhor.y);
	// console.log(pos_f)
	var melhores = pos_f.map(c => painéis[c.y][c.x]);
	// console.log(melhores)
	/** @type { number } */
	var i = melhores[0].valor;
	/** @type { Painél[] } */
	const raios = [];
	
	do{
		melhores = melhores.map(painél => {
			var p = painél.vizinhos().reduce(
				(a, b) => a.valor === - 1
					? b
					: (
						b.valor === - 1
						? a
						: (a.valor < b.valor ? a : b)
					)
			);
			// console.log(p)
			return p;
		});
		raios.push(...melhores);
		yield { raios };
		i--;
		// console.log(melhores, i)
	}while(melhores.length && i > - 1);
}

var	frame = 0, 
	generator = calculateLightning();

const { paredes } = generator.next().value;

const	lightning_func	= getFrame.lightning(W, H, defs, A, paredes, lightningLightPower),
		search_func		= getFrame.search	(W, H, defs, A, paredes, cellLightPower, 3);

// Pegar paredes
for(var frameData1 of generator){
	/** @type { Cell[] } */
	const células = painéis_lista.map(painél => ({
		height: painél.y,
		isActive: painél.valor > - 1,
		x: painél.x, y: painél.y
	}));
	output(frame, search_func(frame, células));
	frame++;
}
var { pos, melhor } = frameData1;

for(var frameData2 of simulateLightning({ pos, melhor, painéis })){
	/** @type { Lightning[] } */
	const raios = frameData2.raios.map(raio => ({ x: raio.x, y: raio.y }));
	output(frame, lightning_func(frame, raios));
	frame++;
}

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

/**
 * @typedef { { x: number, y: number } } Coord
 */