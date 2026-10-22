// Base de datos de Negocios
const N = {
    comedor: { n:'Comedor', cf:1500, p:25, a:.0005, b:-.12, c:18, req:150 },
    truck: { n:'Food truck', cf:600, p:18, a:.002, b:-.25, c:14, req:40 },
    pizza: { n:'Pizzería', cf:4000, p:45, a:.0008, b:-.2, c:30, req:200 },
    cafe: { n:'Cafetería', cf:2200, p:20, a:.0003, b:-.09, c:12, req:120 }
};

// Base de datos de Terrenos
// Base de datos de Terrenos (Actualizada con fotos)
// Base de datos de Terrenos (Con fotos locales para funcionar sin internet)
const T = [
    { n:'Lote Cayalá Plaza', L:40, f:[-.01, .6, 20], g:[0, 0, 2], m2:500, img:'img/lote1.jpg' },
    { n:'Vista Cancún Mar', L:20, f:[-.02, .5, 8], g:[0, 0, 1], m2:900, img:'img/lote2.jpg' },
    { n:'Costa Roatán Sur', L:30, f:[.01, .2, 12], g:[0, 0, 1.5], m2:600, img:'img/lote3.jpg' },
    { n:'Mini-lote Urbano', L:10, f:[-.03, .4, 5], g:[0, 0, .5], m2:1500, img:'img/lote4.jpg' }
];

// Estado global de la aplicación
let S, K = 'comedor', LT = 0;

// Fórmulas Matemáticas Puras
const Iq = (q, x) => q[0] * x**3 / 3 + q[1] * x*x / 2 + q[2] * x;
const Q = s => [s.a, s.b, s.c];
const cmg = x => S.a * x*x + S.b * x + S.c;
const Ct = x => Iq(Q(S), x) + S.cf;
const G = (x, p) => p * x - Ct(x);

const optP = (p, s = S) => {
    const d = s.b * s.b - 4 * s.a * (s.c - p);
    if(d < 0) return null;
    const x = (-s.b + Math.sqrt(d)) / (2 * s.a);
    return x >= 0 ? x : null;
};

const ev = (q, x) => q[0] * x*x + q[1] * x + q[2];
const wd = (t, x) => ev(t.f, x) - ev(t.g, x);
const area = t => Iq(t.f, t.L) - Iq(t.g, t.L);

function numeric(t, n = 8) {
    const h = t.L / n;
    const y = [...Array(n+1)].map((_, i) => wd(t, i*h));
    let Tr = y[0] + y[n], Sm = Tr;
    for(let i = 1; i < n; i++) {
        Tr += 2 * y[i];
        Sm += (i % 2 ? 4 : 2) * y[i];
    }
    return { tr: (h / 2) * Tr, sm: (h / 3) * Sm, y, h };
}