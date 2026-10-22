// Utilidades de interfaz
const $ = id => document.getElementById(id);
const fq = v => 'Q ' + Math.round(v).toLocaleString('es-GT');
const f1 = v => v.toLocaleString('es-GT', { maximumFractionDigits: 1 });
const f2 = v => v.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Configuración base de Plotly (Tema Corporativo)
const base = { paper_bgcolor:'rgba(0,0,0,0)', plot_bgcolor:'#ffffff', font:{color:'#3d4b5c', family:'IBM Plex Sans, sans-serif', size:12}, uirevision:'a' };
const ax = t => ({ title:{text:t, font:{size:12, color:'#5d6b7c'}}, gridcolor:'#e6ebf2', zerolinecolor:'#b8c3d1', linecolor:'#c9d2de', tickfont:{color:'#5d6b7c'}, backgroundcolor:'#f7f9fc', showbackground:true });
const cfg = { displayModeBar: false, responsive: true };
const EJE3 = t => ({ ...ax(t), gridcolor:'#d5dde8', showspikes:false });

function rg(id, min, max, v, st) { const e = $(id); e.min = min; e.max = max; e.step = st; e.value = v; }

function setN(k) {
    K = k; S = {...N[k]};
    rg('p', (S.p * .4).toFixed(1), S.p * 2.2, S.p, .5);
    rg('cf', 0, S.cf * 2.5, S.cf, 50);
    document.querySelectorAll('#chips .chip').forEach(c => c.classList.toggle('on', c.dataset.k === k));
    drawN();
}

function readN() { S.p = +$('p').value; S.cf = +$('cf').value; return optP(S.p); }

function drawN() {
    const xo = readN(), XM = Math.ceil((xo||400)*1.6/10)*10, gm = xo === null ? 0 : G(xo, S.p);
    $('vp').textContent = 'Q ' + f2(S.p); $('vcf').textContent = fq(S.cf);$('say').innerHTML = xo === null ? 'Con ese precio <em>no hay ganancia</em>. Sube el precio o baja los costos.' : 'Vende <em>' + Math.round(xo) + ' platos</em> al día. Ahí ganas lo máximo: <i>' + fq(gm) + '</i>.';
    
    const xs = [...Array(121)].map((_,i) => XM*i/120), xa = xo ? xs.filter(v => v <= xo).concat([xo]) : [];
    
    // Gráfica 2D de Costo Marginal y Precio
    Plotly.react('g2',[
        {x:xa.concat([...xa].reverse()), y:xa.map(()=>S.p).concat([...xa].reverse().map(cmg)), fill:'toself', fillcolor:'rgba(12,143,102,.16)', line:{width:0}, name:'Tu ganancia', hoverinfo:'skip'},
        {x:xs, y:xs.map(cmg), name:'Lo que cuesta cada plato extra', line:{color:'#b4651f', width:2.5, shape:'spline'}},
        {x:[0,XM], y:[S.p,S.p], name:'Lo que cobras', line:{color:'#2c5f8a', width:2.5, dash:'dash'}},
        {x:xo?[xo]:[], y:xo?[S.p]:[], mode:'markers', name:'Punto óptimo', marker:{symbol:'diamond', size:13, color:'#0c8f66', line:{color:'#ffffff', width:2}}}
    ], {...base, margin:{l:52,r:12,t:8,b:46}, legend:{orientation:'h', y:1.18, font:{size:12}}, xaxis:{...ax('Platos al día'), range:[0,XM]}, yaxis:{...ax('Q por plato'), rangemode:'tozero'}}, cfg);

    const P = [...Array(34)].map((_,i) => S.p*(.5+1.2*i/33)), X = [...Array(48)].map((_,i) => XM*i/47), rd = P.map(p => ({p, x: optP(p)})).filter(o => o.x !== null && o.x <= XM);
    
    // Gráfica 3D de Ganancia
    Plotly.react('g3',[
        {type:'surface', x:X, y:P, z:P.map(p=>X.map(v=>G(v,p))), cmid:0, colorscale:[[0,'#9c3b2e'],[.3,'#e2a46f'],[.5,'#f4efe4'],[.75,'#74b79b'],[1,'#0a6b4d']], showscale:false, opacity:1, lighting:{ambient:.75, diffuse:.55, specular:.2, roughness:.7}, contours:{z:{show:true, usecolormap:false, color:'rgba(27,39,53,.25)', width:1}}},
        {type:'scatter3d', mode:'lines+markers', x:rd.map(o=>o.x), y:rd.map(o=>o.p), z:rd.map(o=>G(o.x,o.p)+30), line:{color:'#1b2735', width:5}, marker:{symbol:'square', size:3, color:'#1b2735'}}
    ], {...base, plot_bgcolor:'rgba(0,0,0,0)', margin:{l:0,r:0,t:0,b:0}, showlegend:false, scene:{xaxis:EJE3('Platos'), yaxis:EJE3('Precio'), zaxis:EJE3('Ganancia'), camera:{eye:{x:-1.9, y:-1.05, z:.5}, center:{x:0, y:0, z:-.1}}, aspectratio:{x:1.2, y:1, z:.7}}}, cfg);
    
    // Procedimiento Matemático
    $('procN').textContent = "C'(x) = "+S.a+"x² + ("+S.b+")x + "+S.c+"   (lo que cuesta cada plato extra)\nC(x) = ∫C'(x)dx = ("+S.a+"/3)x³ + ("+S.b+"/2)x² + "+S.c+"x + "+S.cf+"   (costo fijo es constante de integración)\nÓptimo: precio = C'(x) → "+S.a+"x² + ("+S.b+")x + "+f2(S.c-S.p)+" = 0 → x ≈ "+(xo===null?'no existe':f2(xo))+"\nGanancia máxima = ∫(precio − C'(x))dx − costo fijo = "+(xo===null?'—':f2(gm));
    drawI();
}

function setT(i) { LT = i; document.querySelectorAll('.lot').forEach((c,j) => c.classList.toggle('on', j===i)); drawT(); }

function drawT() {
    const t = T[LT], A = area(t), nm = numeric(t), tx = [...Array(41)].map((_,i) => t.L*i/40), ty = [0,.25,.5,.75,1];
    $('sayT').innerHTML = '<em>' + f1(A) + ' m²</em> por <i>' + fq(A*t.m2) + '</i>.';$('chk').innerHTML = 'Trapecio: ' + f1(nm.tr) + ' m²<br>Simpson: ' + f1(nm.sm) + ' m²<br>Exacto: ' + f1(A) + ' m²';
    
    // El terreno base
    const wall = q => ({ type:'surface', x:[tx,tx], y:[tx.map(v=>ev(q,v)), tx.map(v=>ev(q,v))], z:[tx.map(()=>0), tx.map(()=>2.5)], showscale:false, opacity:.3, colorscale:[[0,'#516a85'],[1,'#516a85']], hoverinfo:'skip' });
    
    // Matemática del Holograma del Edificio (Bloque 3D)
    const lado = Math.sqrt(S.req); 
    const inicioX = (t.L - lado) / 2;
    const hx = [inicioX, inicioX + lado]; 
    const hy = [4, 4 + lado]; // Posición Y estimada al centro del terreno
    const bloque = { type: 'surface', x: [hx, hx], y: [hy, hy], z: [[4,4], [4,4]], surfacecolor: [[1,1],[1,1]], colorscale: [[0,'rgba(44,95,138,0.8)'],[1,'rgba(44,95,138,0.8)']], showscale: false, name: 'Edificio' };

    Plotly.react('gt',[
        {type:'surface', x:ty.map(()=>tx), y:ty.map(s=>tx.map(v=>ev(t.g,v)+s*wd(t,v))), z:ty.map(()=>tx.map(()=>0)), surfacecolor:ty.map(()=>tx.map(v=>wd(t,v))), colorscale:[[0,'#e9dfc8'],[.5,'#a8c3a0'],[1,'#2e7d5b']], showscale:false, lighting:{ambient:.9, diffuse:.3}},
        wall(t.f), wall(t.g),
        {type:'scatter3d', mode:'markers', x:nm.y.map((_,i)=>i*nm.h), y:nm.y.map((_,i)=>ev(t.f,i*nm.h)), z:nm.y.map(()=>.1), marker:{symbol:'diamond', size:6, color:'#b4651f', line:{color:'#ffffff', width:1}}},
        bloque // ¡Inyectamos el holograma!
    ], {...base, plot_bgcolor:'rgba(0,0,0,0)', margin:{l:0,r:0,t:0,b:0}, showlegend:false, scene:{aspectmode:'data', xaxis:EJE3('Largo (m)'), yaxis:EJE3('Ancho (m)'), zaxis:{...EJE3(''), range:[0,Math.max(t.L/6,4)]}, camera:{eye:{x:1.35, y:-1.25, z:1}}}}, cfg);
    
    $('procT').textContent = "Área = ∫ de 0 a "+t.L+" de [f(x) − g(x)]dx\nf(x) − g(x) = "+(t.f[0]-t.g[0])+"x² + "+(t.f[1]-t.g[1])+"x + "+(t.f[2]-t.g[2])+"\nF(x) = ("+(t.f[0]-t.g[0])+"/3)x³ + ("+(t.f[1]-t.g[1])+"/2)x² + "+(t.f[2]-t.g[2])+"x\nÁrea = F("+t.L+") − F(0) = "+f2(A)+" m²   →   precio = "+f2(A)+" × "+t.m2+" = Q "+f2(A*t.m2)+"\nTrapecio (rectas, h = "+f2(nm.h)+" m) = "+f2(nm.tr)+" m²   |   Simpson (parábolas) = "+f2(nm.sm)+" m²";
    drawI();
}

function drawI() {
    const t = T[LT], A = area(t), xo = optP(S.p), gm = xo===null ? 0 : G(xo,S.p), cabe = A>=S.req;
    const costoTotal = A * t.m2;
    
    $('payA').textContent = S.n + ' en ' + t.n;
    if(!cabe) { 
        $('pay').textContent = 'No cabe';$('payB').textContent = 'El negocio necesita '+S.req+' m² y el lote tiene '+f1(A)+' m².'; 
        if($('panelBanco'))$('panelBanco').style.display = 'none'; 
    }
    else if(gm<=0) { 
        $('pay').textContent = 'Sin ganancia';$('payB').textContent = 'Ajusta el precio arriba.'; 
        if($('panelBanco'))$('panelBanco').style.display = 'none'; 
    }
    else { 
        const d = costoTotal/gm; 
        $('pay').textContent = 'Lo recuperas en '+f1(d/30)+' meses';$('payB').textContent = 'Terreno de '+fq(costoTotal)+' entre ganancia de '+fq(gm)+' al día.'; 
        if($('panelBanco')) {$('panelBanco').style.display = 'block';
            
            // Lógica del Simulador Bancario
            const pctEnganche = +$('enganche').value;
            $('lblEnganche').textContent = pctEnganche + '%';
            const montoPrestamo = costoTotal * (1 - (pctEnganche/100));
            const tasaMensual = 0.08 / 12; // 8% anual
            const meses = 60; // 5 años
            const cuota = (montoPrestamo * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -meses));
            const gananciaMensual = gm * 30;

            $('txtPrestamo').textContent = fq(montoPrestamo);
            $('txtCuota').textContent = fq(cuota);$('txtGananciaMes').textContent = fq(gananciaMensual);

            const badge = $('badgeAprobado');
            if(gananciaMensual >= (cuota * 1.5)) {
                badge.className = 'badge aprobado'; badge.textContent = '✅ CRÉDITO APROBADO';
            } else {
                badge.className = 'badge rechazado'; badge.textContent = '❌ RIESGO ALTO';
            }
        }
    }
    
    document.querySelectorAll('.lot small').forEach((s,j) => { const a = area(T[j]); s.innerHTML = a>=S.req ? '<span class="ok">Cabe tu '+S.n.toLowerCase()+'</span>' : '<span class="no">Muy pequeño</span>'; });
}

// Inicialización de la vista
$('chips').innerHTML = Object.keys(N).map(k => `<button class="chip" data-k="${k}">${N[k].n}</button>`).join('');

// Inyectamos las tarjetas con imágenes de fondo
$('lots').innerHTML = T.map((t,i) => `
    <button class="lot" data-i="${i}">
        <div class="lot-img" style="background-image:url('${t.img}')"></div>
        <div class="lot-info">
            <h4>${t.n}</h4><span class="big">${f1(area(t))} m²</span><small></small>
        </div>
    </button>`).join('');

document.querySelectorAll('#chips .chip').forEach(c => c.onclick = () => setN(c.dataset.k));
document.querySelectorAll('.lot').forEach(c => c.onclick = () => setT(+c.dataset.i));
['p','cf'].forEach(id => $(id).addEventListener('input', drawN));
if($('enganche'))$('enganche').addEventListener('input', drawI);

let ang = -.9, spin = true;
$('g3').addEventListener('pointerdown', () => spin = false);
setInterval(()=>{if(!spin||!window.Plotly)return; ang+=.008; Plotly.relayout('g3',{'scene.camera.eye':{x:2*Math.cos(ang+3.6),y:2*Math.sin(ang+3.6),z:.5}})}, 90);

setN('comedor'); setT(0);

// ====== GENERACIÓN DEL PDF CORREGIDA ======
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function htmlPropuesta(pn, pt) {
    const t = T[LT], A = area(t), nm = numeric(t), xo = optP(S.p), gm = xo===null ? 0 : G(xo,S.p), cabe = A>=S.req, costoT = A*t.m2;
    const fila = (a,b) => '<tr><td>'+a+'</td><td>'+b+'</td></tr>';
    let ret;
    if(!cabe) ret = '<div class="big2" style="color:#c0392b">No cabe</div><p>'+esc(S.n)+' necesita '+S.req+' m² y el terreno tiene '+f1(A)+' m².</p>';
    else if(gm<=0) ret = '<div class="big2" style="color:#c0392b">Sin ganancia</div><p>Ajuste su precio de venta.</p>';
    else { const d = costoT/gm; ret = '<div class="big2">'+f1(d/30)+' meses ('+Math.round(d)+' días)</div><p>Inversión en terreno de '+fq(costoT)+' entre ganancia diaria de '+fq(gm)+'.</p>'; }
    
    return `
        <div style="background:#fff; color:#1a2033; font:14px/1.6 Arial,sans-serif; padding:15px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:3px solid #2c5f8a; padding-bottom:10px;">
                <h1 style="margin:0; font-size:26px; color:#0b1330;">Punto Óptimo</h1>
                <small>${new Date().toLocaleDateString('es-GT')}</small>
            </div>
            <p><b>Propuesta:</b> ${esc(S.n)} en ${esc(t.n)}</p>
            
            <h2 style="font-size:17px; margin-top:20px; border-bottom:2px solid #0c8f66; color:#0b1330;">1. Resumen del negocio: ${esc(S.n)}</h2>
            <table style="width:100%; border-collapse:collapse;">
                ${fila('Precio de venta por plato', 'Q '+f2(S.p))} ${fila('Costos fijos', fq(S.cf))}
                ${fila('Platos óptimos por día', xo===null?'No existe':f1(xo))}
                ${fila('Ganancia máxima por día', xo===null?'—':fq(gm))}
            </table>

            <h2 style="font-size:17px; margin-top:20px; border-bottom:2px solid #0c8f66; color:#0b1330;">2. Terreno elegido: ${esc(t.n)}</h2>
            <table style="width:100%; border-collapse:collapse;">
                ${fila('Largo', t.L+' m')} ${fila('Área exacta (integral)', f2(A)+' m²')}
                ${fila('Trapecio / Simpson', f1(nm.tr)+' / '+f1(nm.sm)+' m²')}
                ${fila('Precio total del terreno', fq(costoT))}
            </table>

            <h2 style="font-size:17px; margin-top:20px; border-bottom:2px solid #0c8f66; color:#0b1330;">3. Retorno de la inversión</h2>
            ${ret}

            <div style="page-break-before:always;">
                <h2 style="font-size:17px; border-bottom:2px solid #0c8f66; color:#0b1330;">4. Anexo técnico: desarrollo matemático</h2>
                <p><b>A. Costo marginal y punto óptimo</b></p>
                <pre style="background:#f4f6fb; border:1px solid #e3e6f0; padding:10px; border-radius:5px; font-family:'Courier New',monospace;">${esc(pn)}</pre>
                <p><b>B. Área del terreno</b></p>
                <pre style="background:#f4f6fb; border:1px solid #e3e6f0; padding:10px; border-radius:5px; font-family:'Courier New',monospace;">${esc(pt)}</pre>
            </div>
        </div>
    `;
}

function descargarPDF() {
    if(typeof html2pdf === 'undefined') { alert('Error: No se pudo cargar el PDF. Revisa tu internet.'); return; }
    
    const b = $('btnPdf'), txt = b.textContent;
    b.disabled = true; b.textContent = 'Generando PDF...';
    
    const contenidoHTML = htmlPropuesta($('procN').textContent, $('procT').textContent);
    const nombre = 'Propuesta_PuntoOptimo_' + S.n.replace(/\s+/g,'') + '_' + T[LT].n.replace(/\s+/g,'') + '.pdf';
    
    html2pdf().set({
        margin: 10,
        filename: nombre,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'letter', orientation: 'portrait' }
    }).from(contenidoHTML).save().then(() => {
        b.disabled = false; b.textContent = txt;
    });
}