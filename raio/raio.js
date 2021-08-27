/**
 * @author Guilherme Zaluchi <desenv@guilherme.zaluchi.com.br>
 * @version 1.0.1
 * @copyrights All lefts shared. Please copy it.
 */

// It might be in PT-BR, but as the logic is in JavaScript, its certainly understandable

// --- Configs ---
	// The height (in squares)
const	altura = 160,
	// The width (in squares)
	largura = 96,
	// The chance of a vertical line be formed
	chance_vertical = 0.5,
	// The chance of a horizontal line be formed
	chance_horizontal = 0.7;

// In ms, it represents:
const delays = [
	// The delay between each search step
	25,
	// The delay between each lightning return
	50
];
	// The CSS color of the border of the maze
const	COR = "#ffffff88",
	// The CSS color of the lightning
	COR_RAIO = "orange";

// --- End of Configs ---

const wait = ms => new Promise(res => setTimeout(res, ms));

/** @type { Painél[][] } */
var painéis;

/**
 * A JS class representation of the walls of each square
 * @class Paredes
 */
class Paredes{
	// If left wall
	_esquerda = false;
	// If top wall
	_cima = false;
	// If right wall
	_direita = false;
	// If bottom wall
	_baixo = false;
	/**
	 * 
	 * @param { Painél } painél 
	 * @memberof Paredes
	 */
	constructor(painél){
		this.painél = painél;
	}
	get esquerda(){ return this._esquerda; }
	set esquerda(b){
		this.painél.elemento.style.borderLeftColor = Paredes.cor(this._esquerda = !!b);
	}
	get cima(){ return this._cima; }
	set cima(b){
		this.painél.elemento.style.borderTopColor = Paredes.cor(this._cima = !!b);
	}
	get direita(){ return this._direita; }
	set direita(b){
		this.painél.elemento.style.borderRightColor = Paredes.cor(this._direita = !!b);
	}
	get baixo(){ return this._baixo; }
	set baixo(b){
		this.painél.elemento.style.borderBottomColor = Paredes.cor(this._baixo = !!b);
	}
}
Paredes.cores = [ "transparent", COR ];
Paredes.cor = b => Paredes.cores[+b];

/**
 * A JS class representation of each square
 * @class Painél
 */
class Painél{
	/**
	 * The HTMLElement
	 * @type { HTMLTableCellElement }
	 */
	elemento = document.createElement("td");
	_valor = - 1;
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
		Painél.linha(y).appendChild(this.elemento);
		this.paredes = new Paredes(this);
	}
	get valor(){ return this._valor; }
	set valor(x){
		this._valor = x | 0;
		var v = 1 - x / (altura * largura);
		v = 5 * (1 - v * v);
		this.elemento.style.backgroundColor =
			`hsla(${Math.floor(360 * v)}deg, 60%, 20%, 0.4)`;
	}
	/**
	 * Generates the walls of the square
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
		if(x === largura - 1)
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
		if(y < altura - 1 && Math.random() < chance_vertical / 2){
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
		if(x < largura - 1 && !paredes.direita){
			ret.push(painéis[y][x + 1]);
		}
		if(y < altura - 1 && !paredes.baixo){
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
		if(x < largura - 1 && (p = painéis[y][x + 1]).valor === - 1 && !paredes.direita)
			ret.push(p);
		if(y < altura - 1 && (p = painéis[y + 1][x]).valor === - 1 && !paredes.baixo)
			ret.push(p);
		
		return ret;
	}
	/**
	 * 
	 * @param { number } y - Número da linha
	 * @returns { HTMLDivElement } Linha
	 */
	static linha(y){
		if(y === this.linhas.length){
			/** @type { HTMLTableRowElement } */
			var el = document.createElement("tr");
			this.linhas.push(el);
			el.classList.add("linha");
			this.elemento.appendChild(el);
		}
		
		return this.linhas[y];
	}
}
/** @type { HTMLTableElement } */
Painél.elemento = document.body.querySelector(".painéis");
/** @type { HTMLTableRowElement[] } */
Painél.linhas = [];

painéis = Array.from(
	{ length: altura },
	(_, i) => Array.from(
		{ length: largura },
		(_, j) => new Painél(j, i)
	)
);//.flat(2);

painéis.slice().flat().forEach(painél => painél.gerarParedes());

async function vai(){
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
	
	do{
		// console.log("Distância %d", i)
		i++;
		pos_n = [];
		do{
			p = pos.shift();
			// console.log(p);
			próximos = painéis[p.y][p.x].próximos();
			próximos.forEach(próximo => {
				próximo.valor = i;
				pos_n.push({ x: próximo.x, y: próximo.y });
			});
		}while(pos.length);
		pos = pos_n;
		// console.log(pos);
		melhor = pos.reduce((m, p) => p.y > m.y ? p : m);
		
		await wait(delays[0]);
	}while(melhor.y < altura - 1);
	
	// console.log(melhor)
	return { pos, melhor };
}
// Pintar caminho
/**
 *
 * @param { Promise<{ pos: Coord[], melhor: Painél }> } promise
 */
async function volta(promise){
	const { pos, melhor } = await promise;
	
	var melhores = pos.reduce((m, p) => {
		if(p.y === melhor.y)
			m.push(p);
		return m;
	}, []).map(c => painéis[c.y][c.x]);
	
	// melhores = [melhores[0]];
	/** @type { number } */
	var i = melhores[0].valor;
	// console.log(i)
	do{
		await wait(delays[1]);
		melhores = melhores.map(painél => {
			painél.elemento.style.backgroundColor = COR_RAIO;
			var p = painél.vizinhos().reduce(
				(a, b) => a.valor === - 1
					? b
					: (
						b.valor === - 1
						? a
						: (a.valor < b._valor ? a : b)
					)
			);
			// console.log(p)
			return p;
		});
		i--;
		// console.log(melhores, i)
	}while(melhores.length && i > - 1);
}
volta(
	vai()
);

/**
 * @typedef { { x: number, y: number } } Coord
 */