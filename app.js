const categories = {
  vivienda:   { label: 'Vivienda',              color: '#1F7A5C', wFijo: 0.25, wVariable: 0.23, maxRec: 0.35,
                tip: 'Incluye alquiler o cuota, más servicios (luz, agua, internet). Se sugiere no pasar del 35% de tu ingreso aquí. Si pagas mantenimiento o servicios con tarjeta, hazlo justo después de la fecha de corte para ganar días de financiamiento gratis — pero paga el total, no el mínimo.' },
  comida:     { label: 'Comida',                color: '#3E9C77', wFijo: 0.13, wVariable: 0.13,
                tip: 'Separa mentalmente "mercado de la semana" de "comer fuera" aunque los sumes en una sola cifra aquí. Muchos supermercados tienen días fijos de descuento en carnes y vegetales, y algunas tarjetas devuelven cashback ahí — vale la pena ubicar cuáles aplican donde compras.' },
  transporte: { label: 'Transporte',            color: '#6BBE9A', wFijo: 0.08, wVariable: 0.08,
                tip: 'Súmale mantenimiento e imprevistos del carro o moto, no solo el combustible — es lo que más se subestima en este apartado.' },
  colegio:    { label: 'Colegio / Niños',       color: '#2D8ACE', wFijo: 0.09, wVariable: 0.09,
                tip: 'Colegio, uniformes y útiles no caen parejo todo el año. Reserva un poco cada mes para agosto/septiembre en vez de sentirlo todo de golpe.' },
  salud:      { label: 'Salud',                 color: '#3AA0A0', wFijo: 0.04, wVariable: 0.05,
                tip: 'Medicamentos recurrentes y consultas van aquí. Si aún no tienes seguro médico, este suele ser el primer apartado que conviene hacer crecer apenas puedas.' },
  seguros:    { label: 'Seguros',               color: '#4C6B8A', wFijo: 0.05, wVariable: 0.04,
                tip: 'Seguro médico, de auto, de hogar o de vida si tienes alguno — no solo el médico. Es de los gastos que más se olvidan hasta que realmente se necesitan.' },
  mascotas:   { label: 'Mascotas',              color: '#C2447A', wFijo: 0.05, wVariable: 0.04,
                tip: 'Comida, veterinario, vacunas y antipulgas van aquí. Si tienes mascota, este gasto existe siempre aunque no esté presupuestado — mejor darle su espacio real que sacarlo de otra categoría a la fuerza.' },
  deudas:     { label: 'Deudas',                color: '#8B5CF6', wFijo: 0.10, wVariable: 0.09, maxRec: 0.20,
                tip: 'Paga primero la deuda con la tasa de interés más alta (casi siempre la tarjeta de crédito), aunque el monto total sea el más pequeño. Si esta categoría supera el 20% de tu ingreso, empieza a preocuparte por el interés que estás pagando, no solo por el monto.' },
  ahorro:     { label: 'Ahorro',                color: '#B4432A', wFijo: 0.13, wVariable: 0.19,
                tip: 'Trátalo como una factura fija, no como lo que sobra al final. Si no tienes fondo de emergencia, prioriza acumular aquí el equivalente a 3 meses de tus gastos básicos antes que cualquier otra meta — y si recibes regalía en diciembre, aparta una parte antes de que desaparezca.' },
  familia:    { label: 'Apoyo a familia / Remesas', color: '#E8A33D', wFijo: 0.04, wVariable: 0.03,
                tip: 'Si envías o recibes dinero de familiares con regularidad, dale su propia categoría — así no se mezcla con tu gasto personal y puedes verlo claro.' },
  diversion:  { label: 'Diversión',             color: '#66766D', wFijo: 0.04, wVariable: 0.03,
                tip: 'Un presupuesto sin espacio para disfrutar rara vez se cumple. Ponle un número chico pero real, no lo dejes en cero.' },
};

let selected = new Set();
let locked = {};
let incomeType = 'fijo';

// 👇 Configura aquí tus URLs reales de Embed cuando estén listas
const VIDEO_EMBED_URL = '';
const VIDEO_EMBED_URL_2 = '';
const VIDEO_EMBED_URL_3 = '';
const VIDEO_EMBED_URL_COURSE_1 = '';

const kidsTasks = [
  { id: 'frasco',  text: 'Ahorra 3 monedas de tu domingo/mesada en un frasco transparente y cuéntalas cada semana.' },
  { id: 'vender',  text: 'Vende algo tuyo que ya no uses (a un familiar o vecino) y anota cuánto ganaste.' },
  { id: 'tarea',   text: 'Haz una tarea extra en casa a cambio de una "paga" — y decide tú en qué gastarla.' },
  { id: 'invento', text: 'Inventa algo simple para vender un día (limonada, pulseras, lavar carros).' },
  { id: 'mitad',   text: 'Cuando recibas dinero de regalo, guarda la mitad antes de gastar el resto.' },
  { id: 'cuenta',  text: 'Cuéntale a un adulto qué harías si tuvieras tu propio negocio.' },
];
let kidsChecked = {};
let kidsUnlocked = false;

const leaks = [
  { id: 'lista',    text: 'Voy al súper sin lista y termino comprando cosas que no pensaba llevar.', amount: 30 },
  { id: 'comida',   text: 'Casi siempre como fuera en vez de llevar comida de casa al trabajo.', amount: 40 },
  { id: 'recargas', text: 'Compro recargas sueltas de datos/minutos en vez de un paquete.', amount: 12 },
  { id: 'subs',     text: 'Tengo suscripciones (streaming, apps) que ya casi no uso pero sigo pagando.', amount: 10 },
  { id: 'compara',  text: 'Compro cosas grandes sin comparar precio en más de un lugar.', amount: 18 },
];
let leakChecked = {};

function weightOf(key){
  return incomeType === 'variable' ? categories[key].wVariable : categories[key].wFijo;
}

const chipsEl = document.getElementById('chips');
const resultsEl = document.getElementById('results');
const incomeEl = document.getElementById('income');
const countTag = document.getElementById('countTag');

function buildChips(){
  Object.entries(categories).forEach(([key, cat])=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.dataset.key = key;
    chip.innerHTML = `<span class="dot"></span>${cat.label}`;
    chip.addEventListener('click', ()=>{
      if(selected.has(key)){
        selected.delete(key);
        delete locked[key];
      } else {
        selected.add(key);
      }
      chip.classList.toggle('active');
      render();
    });
    chipsEl.appendChild(chip);
  });
}

function buildLeaks(){
  const container = document.getElementById('leakItems');
  leaks.forEach(leak=>{
    const item = document.createElement('div');
    item.className = 'leak-item';
    item.innerHTML = `<span class="leak-checkbox" id="leakbox-${leak.id}"></span><span class="leak-text">${leak.text}</span>`;
    item.addEventListener('click', ()=>{
      leakChecked[leak.id] = !leakChecked[leak.id];
      document.getElementById(`leakbox-${leak.id}`).classList.toggle('checked', leakChecked[leak.id]);
      document.getElementById(`leakbox-${leak.id}`).textContent = leakChecked[leak.id] ? '✓' : '';
      renderLeakResult();
    });
    container.appendChild(item);
  });
}

function renderLeakResult(){
  const total = leaks.reduce((sum, l)=> sum + (leakChecked[l.id] ? l.amount : 0), 0);
  const resultEl = document.getElementById('leakResult');
  if(total > 0){
    document.getElementById('leakAmount').textContent = `~$${total}/mes`;
    const income = getIncome();
    const newTotal = income + total;
    document.getElementById('leakMsg').textContent = income > 0
      ? `Si ajustas esos hábitos, tu ingreso disponible este mes podría subir de $${fmt(income)} a $${fmt(newTotal)}.`
      : `Ese es dinero que hoy se te va sin darte cuenta — ajustarlo no cuesta nada, solo el hábito.`;
    resultEl.classList.add('show');
  } else {
    resultEl.classList.remove('show');
  }
}

function getIncome(){
  const v = parseFloat(incomeEl.value);
  return isNaN(v) || v < 0 ? 0 : v;
}

function computeAmounts(){
  const income = getIncome();
  const amounts = {};
  let lockedSum = 0;
  let unlockedWeightSum = 0;

  selected.forEach(key=>{
    if(locked[key] != null){
      lockedSum += locked[key];
    } else {
      unlockedWeightSum += weightOf(key);
    }
  });

  let remaining = income - lockedSum;
  if(remaining < 0) remaining = 0;

  selected.forEach(key=>{
    if(locked[key] != null){
      amounts[key] = locked[key];
    } else {
      const w = unlockedWeightSum > 0 ? weightOf(key) / unlockedWeightSum : 0;
      amounts[key] = remaining * w;
    }
  });

  return { amounts, income, lockedSum };
}

function fmt(n){
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function render(){
  countTag.textContent = `${selected.size} seleccionado${selected.size===1?'':'s'}`;

  if(selected.size === 0){
    resultsEl.innerHTML = `<div class="empty">Marca al menos una categoría arriba para ver la sugerencia de presupuesto.</div>`;
    return;
  }

  const { amounts, income } = computeAmounts();
  const total = Object.values(amounts).reduce((a,b)=>a+b, 0);

  let barHtml = `<div class="bar-wrap"><div class="bar">`;
  selected.forEach(key=>{
    const pct = income > 0 ? (amounts[key] / income * 100) : 0;
    barHtml += `<div class="bar-seg" style="width:${pct}%; background:${categories[key].color}"></div>`;
  });
  const overBudget = total > income + 0.5;
  barHtml += `</div><div class="bar-caption"><span class="used ${overBudget?'over':''}">$${fmt(total)} asignados</span><span>de $${fmt(income)}</span></div></div>`;

  let cardsHtml = '';
  selected.forEach(key=>{
    const cat = categories[key];
    const amt = amounts[key] || 0;
    const pct = income > 0 ? (amt / income * 100) : 0;
    const isLocked = locked[key] != null;

    let semaforoHtml = '';
    let alertHtml = '';
    if(cat.maxRec){
      const ratio = income > 0 ? (amt / income) : 0;
      let level = 'green';
      if(ratio > cat.maxRec) level = 'red';
      else if(ratio > cat.maxRec * 0.85) level = 'yellow';
      semaforoHtml = `<span class="semaforo ${level}"></span>`;
      if(level === 'red'){
        const recPct = Math.round(cat.maxRec*100);
        alertHtml = `<div class="alert-line show">${cat.label} supera el ${recPct}% sugerido de tu ingreso. No es el fin del mundo, pero vale la pena vigilar de cerca el resto del presupuesto este mes.</div>`;
      }
    }

    cardsHtml += `
      <div class="cat-card">
        <div class="cat-top">
          <div class="cat-name-row">
            <span class="swatch" style="background:${cat.color}"></span>
            <span class="cat-name">${cat.label}</span>
            <button class="info-btn" data-tip="${key}">i</button>
          </div>
          <span class="pct">${pct.toFixed(0)}%${semaforoHtml}</span>
        </div>
        <div class="cat-bottom">
          <span class="amt-currency">$</span>
          <input class="amt-input" type="number" inputmode="decimal" data-key="${key}" value="${amt.toFixed(0)}">
          ${isLocked ? `<button class="reset-btn" data-reset="${key}">Auto</button>` : ``}
        </div>
        ${alertHtml}
        <div class="tip" id="tip-${key}">${cat.tip}</div>
      </div>
    `;
  });

  resultsEl.innerHTML = barHtml + cardsHtml + `
    <div class="cta-row">
      <button class="summary-btn" id="summaryBtn">Ver mi resumen →</button>
    </div>
  `;

  resultsEl.querySelectorAll('.amt-input').forEach(inp=>{
    inp.addEventListener('input', (e)=>{
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value);
      locked[key] = isNaN(val) ? 0 : val;
      render();
      const newInp = resultsEl.querySelector(`.amt-input[data-key="${key}"]`);
      if(newInp){ newInp.focus(); newInp.setSelectionRange(newInp.value.length, newInp.value.length); }
    });
  });

  resultsEl.querySelectorAll('[data-reset]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const key = e.target.dataset.reset;
      delete locked[key];
      render();
    });
  });

  resultsEl.querySelectorAll('.info-btn').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const key = e.target.dataset.tip;
      document.getElementById(`tip-${key}`).classList.toggle('show');
    });
  });

  const summaryBtn = document.getElementById('summaryBtn');
  if(summaryBtn){ summaryBtn.addEventListener('click', openSummary); }
}

function openSummary(){
  const { amounts, income } = computeAmounts();
  const total = Object.values(amounts).reduce((a,b)=>a+b, 0);

  document.getElementById('summaryTotal').textContent = `$${fmt(total)}`;
  document.querySelector('.summary-total .lbl').textContent = `de $${fmt(income)} de ingreso`;

  let rowsHtml = '';
  let waText = `📋 Mi presupuesto de este mes:\n\n`;
  selected.forEach(key=>{
    const cat = categories[key];
    const amt = amounts[key] || 0;
    rowsHtml += `
      <div class="summary-row">
        <span class="r-name"><span class="swatch" style="background:${cat.color}"></span>${cat.label}</span>
        <span class="r-amt">$${fmt(amt)}</span>
      </div>
    `;
    waText += `${cat.label}: $${fmt(amt)}\n`;
  });
  waText += `\nTotal: $${fmt(total)} de $${fmt(income)}\n\nLo armé en minutos con Miscuartos, mi coach financiero de bolsillo — arma el tuyo también 🐾`;

  document.getElementById('summaryRows').innerHTML = rowsHtml;
  document.getElementById('whatsappBtn').href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  document.getElementById('modalOverlay').classList.add('show');
}

document.getElementById('closeModal').addEventListener('click', ()=>{
  document.getElementById('modalOverlay').classList.remove('show');
});
document.getElementById('modalOverlay').addEventListener('click', (e)=>{
  if(e.target.id === 'modalOverlay') e.target.classList.remove('show');
});

document.getElementById('videoCard').addEventListener('click', ()=>{
  if(VIDEO_EMBED_URL){
    document.getElementById('videoFrameWrap').innerHTML = `<iframe src="${VIDEO_EMBED_URL}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  document.getElementById('videoModalOverlay').classList.add('show');
});
document.getElementById('closeVideoModal').addEventListener('click', ()=>{
  document.getElementById('videoModalOverlay').classList.remove('show');
});
document.getElementById('videoModalOverlay').addEventListener('click', (e)=>{
  if(e.target.id === 'videoModalOverlay') e.target.classList.remove('show');
});

buildChips();
buildLeaks();
incomeEl.addEventListener('input', ()=>{ render(); renderLeakResult(); });

document.getElementById('leakToggle').addEventListener('click', ()=>{
  document.getElementById('leakBody').classList.toggle('open');
  document.getElementById('leakChevron').classList.toggle('open');
});

document.getElementById('afpToggle').addEventListener('click', ()=>{
  document.getElementById('afpBody').classList.toggle('open');
  document.getElementById('afpChevron').classList.toggle('open');
});

document.getElementById('videoCard2').addEventListener('click', (e)=>{
  e.stopPropagation();
  if(VIDEO_EMBED_URL_2){
    document.getElementById('videoFrameWrap2').innerHTML = `<iframe src="${VIDEO_EMBED_URL_2}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  document.getElementById('videoModalOverlay2').classList.add('show');
});
document.getElementById('closeVideoModal2').addEventListener('click', ()=>{
  document.getElementById('videoModalOverlay2').classList.remove('show');
});
document.getElementById('videoModalOverlay2').addEventListener('click', (e)=>{
  if(e.target.id === 'videoModalOverlay2') e.target.classList.remove('show');
});

document.getElementById('afpSalario').addEventListener('input', (e)=>{
  const salario = parseFloat(e.target.value);
  const resultEl = document.getElementById('afpSimResult');
  if(!salario || salario <= 0){
    resultEl.classList.remove('show');
    return;
  }
  const tuyo = salario * 0.0287;
  const patronal = salario * 0.0710;
  const anual = tuyo * 12;
  resultEl.innerHTML = `De tu sueldo se descuentan <b>$${tuyo.toFixed(0)}</b> al mes para tu pensión (más <b>$${patronal.toFixed(0)}</b> que pone tu empleador, sin salir de tu bolsillo). Si guardas un monto parecido aparte, en un año tendrías <b>$${anual.toFixed(0)}</b> disponibles para una emergencia real — sin tocar tu pensión, solo complementándola.`;
  resultEl.classList.add('show');
});

function buildKidsTasks(){
  const container = document.getElementById('kidsTasks');
  kidsTasks.forEach(t=>{
    const item = document.createElement('div');
    item.className = 'kids-task';
    item.innerHTML = `<span class="kids-task-check" id="kidsbox-${t.id}"></span><span class="kids-task-text">${t.text}</span>`;
    item.addEventListener('click', ()=>{
      kidsChecked[t.id] = !kidsChecked[t.id];
      const box = document.getElementById(`kidsbox-${t.id}`);
      box.classList.toggle('checked', kidsChecked[t.id]);
      box.textContent = kidsChecked[t.id] ? '✓' : '';
      const done = Object.values(kidsChecked).filter(Boolean).length;
      document.getElementById('kidsProgress').textContent = `${done} de ${kidsTasks.length} retos completados`;
    });
    container.appendChild(item);
  });
}
document.getElementById('courseItem1').addEventListener('click', ()=>{
  if(VIDEO_EMBED_URL_COURSE_1){
    document.getElementById('videoFrameWrapCourse').innerHTML = `<iframe src="${VIDEO_EMBED_URL_COURSE_1}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  document.getElementById('videoModalOverlayCourse').classList.add('show');
});
document.getElementById('closeVideoModalCourse').addEventListener('click', ()=>{
  document.getElementById('videoModalOverlayCourse').classList.remove('show');
});
document.getElementById('videoModalOverlayCourse').addEventListener('click', (e)=>{
  if(e.target.id === 'videoModalOverlayCourse') e.target.classList.remove('show');
});

document.querySelectorAll('.course-item.locked').forEach(item=>{
  item.addEventListener('click', ()=>{
    const title = item.querySelector('.course-item-title').textContent;
    alert(`"${title}" se desbloquea con tu compra de Miscuartos ($9).`);
  });
});

const xmasMonths = [
  ['Agosto', 4], ['Septiembre', 4], ['Octubre', 5], ['Noviembre', 4], ['Diciembre', 5]
];
let xmasLevel = 50;
let xmasChecked = {};

function xmasGoal(level){ return level * 253; }

function buildXmasWeeks(){
  const container = document.getElementById('xmasWeeks');
  container.innerHTML = '';
  let weekNum = 1;
  xmasMonths.forEach(([monthName, count])=>{
    const monthLabel = document.createElement('div');
    monthLabel.className = 'xmas-month';
    monthLabel.textContent = monthName;
    container.appendChild(monthLabel);
    for(let i=0; i<count; i++){
      const w = weekNum;
      const row = document.createElement('div');
      row.className = 'xmas-week';
      row.innerHTML = `<span class="xmas-week-check" id="xmasbox-${w}"></span><span class="xmas-week-label">Semana ${w}</span><span class="xmas-week-amt" id="xmasamt-${w}"></span>`;
      row.addEventListener('click', ()=>{
        xmasChecked[w] = !xmasChecked[w];
        const box = document.getElementById(`xmasbox-${w}`);
        box.classList.toggle('checked', xmasChecked[w]);
        box.textContent = xmasChecked[w] ? '✓' : '';
        renderXmasProgress();
      });
      container.appendChild(row);
      weekNum++;
    }
  });
  renderXmasAmounts();
  renderXmasProgress();
}

function renderXmasAmounts(){
  for(let w=1; w<=22; w++){
    const el = document.getElementById(`xmasamt-${w}`);
    if(el) el.textContent = `$${xmasLevel*w}`;
  }
}

function renderXmasProgress(){
  let saved = 0;
  for(let w=1; w<=22; w++){
    if(xmasChecked[w]) saved += xmasLevel*w;
  }
  const goal = xmasGoal(xmasLevel);
  document.getElementById('xmasProgressNum').textContent = `$${fmt(saved)} de $${fmt(goal)}`;
  const weeksLeft = 22 - Object.values(xmasChecked).filter(Boolean).length;
  document.getElementById('xmasProgressLbl').textContent = saved > 0
    ? `Te faltan ${weeksLeft} semanas para completar tu meta`
    : 'Marca las semanas que ya depositaste';
}

document.querySelectorAll('.xmas-level').forEach(el=>{
  el.addEventListener('click', ()=>{
    xmasLevel = parseInt(el.dataset.level);
    document.querySelectorAll('.xmas-level').forEach(l=>l.classList.toggle('active', l===el));
    renderXmasAmounts();
    renderXmasProgress();
  });
});

buildXmasWeeks();
buildKidsTasks();

document.getElementById('kidsUnlockBtn').addEventListener('click', ()=>{
  kidsUnlocked = true;
  document.getElementById('kidsPreview').classList.add('hide');
  document.getElementById('kidsFull').classList.add('show');
});

document.getElementById('videoCard3').addEventListener('click', ()=>{
  if(VIDEO_EMBED_URL_3){
    document.getElementById('videoFrameWrap3').innerHTML = `<iframe src="${VIDEO_EMBED_URL_3}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }
  document.getElementById('videoModalOverlay3').classList.add('show');
});
document.getElementById('closeVideoModal3').addEventListener('click', ()=>{
  document.getElementById('videoModalOverlay3').classList.remove('show');
});
document.getElementById('videoModalOverlay3').addEventListener('click', (e)=>{
  if(e.target.id === 'videoModalOverlay3') e.target.classList.remove('show');
});

document.querySelectorAll('.type-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    incomeType = btn.dataset.type;
    document.querySelectorAll('.type-btn').forEach(b=>b.classList.toggle('active', b===btn));
    document.getElementById('variableBanner').classList.toggle('show', incomeType === 'variable');
    render();
  });
});

const extraEl = document.getElementById('extraIncome');
const extraTipEl = document.getElementById('extraTip');
extraEl.addEventListener('input', ()=>{
  const v = parseFloat(extraEl.value);
  if(!v || v <= 0){
    extraTipEl.classList.remove('show');
    return;
  }
  const deuda = Math.round(v * 0.5);
  const gusto = Math.round(v * 0.3);
  const proximo = Math.round(v * 0.2);
  extraTipEl.textContent = `Con ese extra, una guía simple es: $${deuda} directo a deudas o ahorro, $${gusto} para un gusto, y $${proximo} guardado para adelantar el próximo mes. No lo mezcles con tu presupuesto normal de arriba — trátalo aparte.`;
  extraTipEl.classList.add('show');
});

render();
