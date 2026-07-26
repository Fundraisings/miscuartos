/* ============ DATOS ============ */
const categories = {
  vivienda:   { label: 'Vivienda',              color: '#1F7A5C', maxRec: 0.35, tip: 'Alquiler, hipoteca, mantenimiento del hogar.' },
  comida:     { label: 'Comida',                color: '#3E9C77', maxRec: 0.20, tip: 'Mercado y compras fijas de alimentos.' },
  servicios:  { label: 'Luz, agua y teléfono',  color: '#6BBE9A', maxRec: 0.10, tip: 'Electricidad, agua e internet/teléfono combinados.' },
  escuela:    { label: 'Escuela',               color: '#2D8ACE', tip: 'Mensualidad, transporte escolar, materiales.' },
  salud:      { label: 'Salud',                 color: '#3AA0A0', tip: 'Medicamentos y consultas médicas fijas.' },
  transporte: { label: 'Transporte',            color: '#8AA6B8', maxRec: 0.15, tip: 'Combustible, concho y mantenimiento básico.' },
  deudas:     { label: 'Deudas',                color: '#8B5CF6', maxRec: 0.20, tip: 'Tarjetas o préstamos. Ataca primero la de mayor interés.' },
  ahorro:     { label: 'Ahorro',                color: '#B4432A', minRec: 0.10, minRecVariable: 0.15, tip: 'Tu colchón de tranquilidad. Trátalo como una factura obligatoria.' },
  mascotas:   { label: 'Mascotas',              color: '#C2447A', tip: 'Comida y cuidados veterinarios — aunque no sea común anotarlo, es un gasto real.' },
  donaciones: { label: 'Donaciones',            color: '#E8A33D', tip: 'Iglesia, fundaciones, causas que te importan — generosidad con intención, no con culpa.' },
  diversion:  { label: 'Diversión',              color: '#66766D', tip: 'Salidas y gustos. Pequeño pero necesario para no rendirte.' }
};

let amounts = {};
let incomeType = 'fijo';
let budgetPeriod = 'mensual';
let totalXmasWeeks = 0;
let selectedGoalIcon = '🏠';

const VIDEO_LINKS = { tutorial: '', afp: '', curso1: '', kids: '', retoXmas: '' };

const leaks = [
  { id: 'lista',    text: 'Ir al súper sin lista escrita', amount: 1500 },
  { id: 'comida',   text: 'Comer fuera en el trabajo frecuentemente', amount: 2500 },
  { id: 'recargas', text: 'Comprar recargas sueltas en vez de paquetes', amount: 600 },
  { id: 'subs',     text: 'Suscripciones que no usas pero sigues pagando', amount: 800 },
  { id: 'compara',  text: 'Comprar cosas grandes sin comparar precio primero', amount: 1000 }
];
let leakChecked = {};

const kidsTasks = [
  { id: 'frasco', text: 'Ahorrar 3 monedas de tu mesada en un frasco transparente.' },
  { id: 'vender', text: 'Vender algo propio que ya no uses (a un familiar o vecino).' },
  { id: 'tarea', text: 'Haz una labor extra en casa a cambio de una "paga".' },
  { id: 'inventar', text: 'Inventar algo simple para vender un día (limonada, pulseras).' },
  { id: 'regalo', text: 'Al recibir dinero de regalo, guarda la mitad antes de gastar.' },
  { id: 'adulto', text: 'Cuéntale a un adulto qué harías si tuvieras tu propio negocio.' }
];
let kidsChecked = {};

const businessIdeas = [
  { title: "💻 Gestión de Redes Locales (Social Media)", desc: "Muchos negocios en RD (salones, colmados grandes, tiendas de ropa) no tienen tiempo de subir contenido. Si sabes usar Canva e Instagram, puedes cobrar desde RD$5,000/mes por cuenta." },
  { title: "🍰 Repostería o Snacks por Encargo", desc: "El dominicano es dulcero. Puedes preparar brownies, galletas o picaderas saladas bajo pedido para eventos o fines de semana sin arriesgar capital en inventario muerto." },
  { title: "📚 Tutorías Escolares o Universitarias", desc: "Si eres bueno en matemáticas, inglés, contabilidad o redacción, ofrece regularización a hijos de vecinos o compañeros. Dos sesiones semanales pueden aportarte entre RD$4,000 y RD$8,000 mensuales." },
  { title: "🛍️ Tienda Virtual Dropshipping / Bajo Pedido", desc: "Crea una página de Instagram estéticamente atractiva y vende artículos tendencia (organizadores, cases, joyería) cobrando el 50% por adelantado para realizar el pedido del proveedor." }
];

/* ============ ACCESIBILIDAD ============ */
function makeKeyboardActivatable(el) {
  if (!el) return;
  el.setAttribute('tabindex', '0');
  el.setAttribute('role', 'button');
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
  });
}

/* ============ SPLASH ============ */
if (document.getElementById('enterAppBtn')) {
  document.getElementById('enterAppBtn').addEventListener('click', () => {
    const splash = document.getElementById('app-splash');
    const mainApp = document.getElementById('mainAppContainer');
    if (splash && mainApp) {
      splash.classList.add('fade-out');
      mainApp.style.display = 'flex';
      setTimeout(() => { splash.style.display = 'none'; }, 600);
      lazyLoadVideos();
    }
  });
}

/* ============ NAVEGACIÓN ============ */
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const targetPane = document.getElementById(`pane-${btn.dataset.tab}`);
    if (targetPane) targetPane.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    lazyLoadVideos();
    if (btn.dataset.tab === 'metas') {
      calculateEmergencyFund();
      calculateTargetGoal();
      buildStreakChecks();
      renderBusinessCatalog();
    }
  });
});

function lazyLoadVideos() {
  const splash = document.getElementById('app-splash');
  if (splash && splash.style.display === 'none') {
    const activePane = document.querySelector('.tab-pane.active');
    if (!activePane) return;
    if (activePane.id === 'pane-presupuesto' && VIDEO_LINKS.tutorial) {
      const el = document.getElementById('embed-tutorial');
      if (el) el.innerHTML = `<iframe src="${VIDEO_LINKS.tutorial}" allowfullscreen></iframe>`;
    }
    if (activePane.id === 'pane-reto' && VIDEO_LINKS.retoXmas) {
      const el = document.getElementById('embed-reto-xmas');
      if (el) el.innerHTML = `<iframe src="${VIDEO_LINKS.retoXmas}" allowfullscreen></iframe>`;
    }
    if (activePane.id === 'pane-academia') {
      const afpEl = document.getElementById('embed-afp');
      const cursoEl = document.getElementById('embed-curso');
      const kidsEl = document.getElementById('embed-kids');
      const kidsFull = document.getElementById('kidsFull');
      if (VIDEO_LINKS.afp && afpEl) afpEl.innerHTML = `<iframe src="${VIDEO_LINKS.afp}" allowfullscreen></iframe>`;
      if (VIDEO_LINKS.curso1 && cursoEl) cursoEl.innerHTML = `<iframe src="${VIDEO_LINKS.curso1}" allowfullscreen></iframe>`;
      if (VIDEO_LINKS.kids && kidsFull && kidsFull.classList.contains('show') && kidsEl) {
        kidsEl.innerHTML = `<iframe src="${VIDEO_LINKS.kids}" allowfullscreen></iframe>`;
      }
    }
  }
}

/* ============ PRESUPUESTO ============ */
const resultsEl = document.getElementById('results');
const incomeEl = document.getElementById('income');
const countTag = document.getElementById('countTag');

function fmt(n) { return Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 }); }

const PERIOD_LABELS = {
  mensual:   { income: 'Ingreso ganado este mes',   gastos: 'Tus gastos este mes',   of: 'ganado este mes',   wa: 'este mes' },
  quincenal: { income: 'Ingreso de esta quincena',  gastos: 'Tus gastos esta quincena', of: 'ganado esta quincena', wa: 'esta quincena' }
};

document.querySelectorAll('.period-btn').forEach(btn => {
  makeKeyboardActivatable(btn);
  btn.addEventListener('click', () => {
    budgetPeriod = btn.dataset.period;
    document.querySelectorAll('.period-btn').forEach(b => b.classList.toggle('active', b === btn));
    applyPeriodLabels();
    const tip = document.getElementById('periodTip');
    if (tip) tip.style.display = budgetPeriod === 'quincenal' ? 'block' : 'none';
    updateTotals(true);
    saveState();
  });
});

function applyPeriodLabels() {
  const lbl = PERIOD_LABELS[budgetPeriod];
  const incomeLabelEl = document.getElementById('incomeLabel');
  const sectionTitleEl = document.querySelector('#pane-presupuesto .section-title');
  if (incomeLabelEl) incomeLabelEl.textContent = lbl.income;
  if (sectionTitleEl) {
    const countSpan = document.getElementById('countTag');
    sectionTitleEl.firstChild.textContent = lbl.gastos + ' ';
    if (countSpan) sectionTitleEl.appendChild(countSpan);
  }
}

function getIncome() {
  if (!incomeEl) return 0;
  const v = parseFloat(incomeEl.value);
  return isNaN(v) || v < 0 ? 0 : v;
}

function getTotalExpenses() {
  let total = 0;
  Object.keys(categories).forEach(key => { total += (amounts[key] || 0); });
  return total;
}

function categoryAdvice(key, amount, income) {
  const cat = categories[key];
  if (!income || income <= 0) return null;

  if (cat.maxRec != null) {
    const recommended = income * cat.maxRec;
    if (amount > recommended) {
      const exceso = amount - recommended;
      const neededIncome = amount / cat.maxRec;
      const pctIncrease = ((neededIncome / income) - 1) * 100;
      const severo = amount > recommended * 1.15;
      return {
        level: severo ? 'red' : 'amber',
        html: `Lo sano aquí sería no pasar de <b>RD$${fmt(recommended)}</b> (${Math.round(cat.maxRec * 100)}% de tu ingreso). Estás <b>RD$${fmt(exceso)}</b> por encima. Baja este gasto en RD$${fmt(exceso)}, o sube tu ingreso a RD$${fmt(neededIncome)} (+${pctIncrease.toFixed(0)}%).`
      };
    }
    return { level: 'green', html: `Vas bien — estás dentro del ${Math.round(cat.maxRec * 100)}% recomendado.` };
  }

  if (cat.minRec != null) {
    const minRec = incomeType === 'variable' && cat.minRecVariable != null ? cat.minRecVariable : cat.minRec;
    const recommended = income * minRec;
    if (amount < recommended) {
      const falta = recommended - amount;
      return {
        level: amount === 0 ? 'red' : 'amber',
        html: `El mínimo saludable sería <b>RD$${fmt(recommended)}</b> (${Math.round(minRec * 100)}% de tu ingreso). Te faltan RD$${fmt(falta)}.`
      };
    }
    return { level: 'green', html: `¡Bien! Estás ahorrando por encima del ${Math.round(minRec * 100)}% mínimo.` };
  }

  return null;
}

function buildCategoryRows() {
  if (!resultsEl) return;
  let html = `
    <div class="sticky-total-box">
      <div class="sticky-total-row">
        <div class="sticky-total-text">
          <div class="sticky-total-num" id="stickyTotalNum">RD$0</div>
          <div class="sticky-total-of" id="stickyTotalOf">de RD$0 ganado este mes</div>
        </div>
        <div class="compass-gauge-wrap">
          <svg class="compass-gauge" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Indicador de cuánto llevas asignado">
            <circle cx="50" cy="50" r="42" stroke="var(--line)" stroke-width="5" fill="none"/>
            <line x1="50" y1="4" x2="50" y2="12" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
            <line x1="50" y1="88" x2="50" y2="96" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
            <line x1="4" y1="50" x2="12" y2="50" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
            <line x1="88" y1="50" x2="96" y2="50" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/>
            <g id="gaugeNeedle" class="gauge-needle">
              <polygon points="50,14 58,50 50,50" fill="var(--brand-orange)"/>
              <polygon points="50,14 42,50 50,50" fill="var(--brand-orange)" opacity="0.9"/>
              <polygon points="50,86 58,50 50,50" fill="var(--ink)"/>
              <polygon points="50,86 42,50 50,50" fill="var(--ink)" opacity="0.95"/>
            </g>
            <circle cx="50" cy="50" r="6" fill="var(--card)" stroke="var(--ink)" stroke-width="2.5"/>
          </svg>
        </div>
      </div>
      <div class="sticky-total-status" id="totalOverWarning" style="display:none;"></div>
    </div>
  `;

  Object.entries(categories).forEach(([key, cat]) => {
    html += `
      <div class="cat-row">
        <div class="cat-row-label"><span class="cat-dot" id="dot-${key}"></span>${cat.label}</div>
        <div class="cat-row-input-wrap">
          <span class="amt-currency">RD$</span>
          <input class="amt-input" type="number" inputmode="decimal" data-key="${key}" placeholder="0" value="${amounts[key] ? amounts[key] : ''}">
        </div>
      </div>`;
  });

  html += `<button class="summary-btn" id="summaryBtn">Ver mi resumen y consejos →</button>`;
  resultsEl.innerHTML = html;

  resultsEl.querySelectorAll('.amt-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const key = e.target.dataset.key;
      const val = parseFloat(e.target.value);
      amounts[key] = isNaN(val) ? 0 : val;
      saveState();
      updateCategoryDot(key);
      showActiveAdvice(key);
      updateCount();
      updateTotals(false);
    });
    inp.addEventListener('focus', (e) => showActiveAdvice(e.target.dataset.key));
    inp.addEventListener('blur', () => updateTotals(true));
  });

  const summaryBtn = document.getElementById('summaryBtn');
  if (summaryBtn) summaryBtn.addEventListener('click', openSummary);

  setTimeout(() => {
    Object.keys(categories).forEach(key => updateCategoryDot(key));
    updateCount();
    updateTotals(true);
  }, 0);
}

function updateCount() {
  if (!countTag) return;
  const withAmount = Object.values(amounts).filter(v => v > 0).length;
  countTag.textContent = `${withAmount} con monto`;
}

function updateCategoryDot(key) {
  const dot = document.getElementById(`dot-${key}`);
  if (!dot) return;
  const amt = amounts[key] || 0;
  if (!amt) { dot.className = 'cat-dot'; return; }
  const advice = categoryAdvice(key, amt, getIncome());
  dot.className = 'cat-dot' + (advice ? ` ${advice.level}` : '');
}

function showActiveAdvice(key) {
  const warnBox = document.getElementById('totalOverWarning');
  if (!warnBox) return;
  const advice = categoryAdvice(key, amounts[key] || 0, getIncome());
  if (!advice) { warnBox.style.display = 'none'; return; }
  const colors = {
    green: { bg: 'var(--accent-soft)', fg: 'var(--accent-solid)' },
    amber: { bg: 'var(--brand-orange-soft)', fg: 'var(--brand-orange)' },
    red:   { bg: 'rgba(180,67,42,0.08)', fg: '#8a3320' }
  };
  const c = colors[advice.level];
  warnBox.style.display = 'block';
  warnBox.style.background = c.bg;
  warnBox.style.color = c.fg;
  warnBox.innerHTML = `<b>${categories[key].label}:</b> ${advice.html}`;
}

function updateTotals(showOverallStatus) {
  const income = getIncome();
  let total = getTotalExpenses();

  const needle = document.getElementById('gaugeNeedle');
  const numEl = document.getElementById('stickyTotalNum');
  const ofEl = document.getElementById('stickyTotalOf');
  const warnBox = document.getElementById('totalOverWarning');
  if (!needle) return;

  const rawPct = income > 0 ? (total / income) : 0;
  // La aguja va de N (0%) a E (100%) y sigue un poco más allá si te pasas, hasta un tope de 150%.
  const rotationDeg = Math.min(rawPct, 1.5) * 90;
  needle.style.transform = `rotate(${rotationDeg}deg)`;
  needle.classList.toggle('over', total > income && income > 0);

  if (numEl) numEl.textContent = `RD$${fmt(total)}`;
  if (ofEl) ofEl.textContent = `de RD$${fmt(income)} ${PERIOD_LABELS[budgetPeriod].of}`;

  if (!showOverallStatus) return;

  if (income > 0 && total > income) {
    const exceso = total - income;
    if (warnBox) {
      warnBox.style.display = 'block';
      warnBox.style.background = 'rgba(180,67,42,0.08)';
      warnBox.style.color = '#8a3320';
      warnBox.innerHTML = `RD$${fmt(exceso)} por encima de lo que ganas. No es un error — es información real.`;
    }
  } else if (income > 0 && total > 0) {
    if (warnBox) {
      warnBox.style.display = 'block';
      warnBox.style.background = 'var(--accent-soft)';
      warnBox.style.color = 'var(--accent-solid)';
      warnBox.innerHTML = `Te queda RD$${fmt(income - total)} sin asignar todavía.`;
    }
  } else if (warnBox) {
    warnBox.style.display = 'none';
  }

  Object.keys(categories).forEach(key => updateCategoryDot(key));
}

function openSummary() {
  const income = getIncome();
  const usedKeys = Object.keys(categories).filter(key => (amounts[key] || 0) > 0);
  let total = 0;
  usedKeys.forEach(key => { total += (amounts[key] || 0); });

  const summaryTotalEl = document.getElementById('summaryTotal');
  if (summaryTotalEl) summaryTotalEl.textContent = `RD$${fmt(total)}`;

  let rows = '';
  let waText = `📋 Los números de la casa ${PERIOD_LABELS[budgetPeriod].wa}:\n\n`;
  usedKeys.forEach(key => {
    const amt = amounts[key] || 0;
    const advice = categoryAdvice(key, amt, income);
    rows += `<div class="summary-row" style="flex-direction:column; align-items:stretch; gap:4px;">
      <div style="display:flex; justify-content:space-between;"><span>${categories[key].label}</span><strong>RD$${fmt(amt)}</strong></div>
      ${advice ? `<div style="font-size:11px; line-height:1.4; color:${advice.level === 'green' ? 'var(--accent-solid)' : advice.level === 'amber' ? 'var(--brand-orange)' : '#8a3320'};">${advice.html}</div>` : ''}
    </div>`;
    waText += `• ${categories[key].label}: RD$${fmt(amt)}\n`;
  });

  waText += `\nTotal: RD$${fmt(total)} de RD$${fmt(income)} de ingreso`;
  if (income > 0 && total > income) {
    waText += `\n⚠️ Nos pasamos por RD$${fmt(total - income)} — hay que ajustar algo.`;
  }
  waText += `\n\nAsí quedamos ${PERIOD_LABELS[budgetPeriod].wa} 🤝`;

  const summaryRowsEl = document.getElementById('summaryRows');
  if (summaryRowsEl) summaryRowsEl.innerHTML = rows;
  const waBtn = document.getElementById('whatsappBtn');
  if (waBtn) {
    waBtn.textContent = 'Enviar acuerdo del mes por WhatsApp';
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(waText)}`;
  }
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.classList.add('show');
}

if (document.getElementById('closeModal')) {
  document.getElementById('closeModal').addEventListener('click', () => {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('show');
  });
}

/* ============ DINERO OCULTO ============ */
function buildLeaks() {
  const box = document.getElementById('leakItems');
  if (!box) return;
  box.innerHTML = '';
  leaks.forEach(l => {
    const item = document.createElement('div');
    item.className = 'leak-item';
    item.innerHTML = `<span class="leak-checkbox" id="lbox-${l.id}"></span><span class="leak-text">${l.text} (~RD$${fmt(l.amount)}/mes)</span>`;
    makeKeyboardActivatable(item);
    item.addEventListener('click', () => {
      leakChecked[l.id] = !leakChecked[l.id];
      const checkbox = document.getElementById(`lbox-${l.id}`);
      if (checkbox) { checkbox.classList.toggle('checked', leakChecked[l.id]); checkbox.textContent = leakChecked[l.id] ? '✓' : ''; }
      const totalLeak = leaks.reduce((s, curr) => s + (leakChecked[curr.id] ? curr.amount : 0), 0);
      const leakAmountEl = document.getElementById('leakAmount');
      const leakMsgEl = document.getElementById('leakMsg');
      if (leakAmountEl) leakAmountEl.textContent = `~RD$${fmt(totalLeak)}/mes`;
      if (leakMsgEl) leakMsgEl.textContent = totalLeak > 0 ? 'Esos cuartos se te van sin darte cuenta.' : '';
    });
    box.appendChild(item);
  });
}

/* ============ RETO NAVIDEÑO ============ */
let xmasLevel = 100;
let xmasChecked = {};
let xmasCheckedAt = {};        // fecha real en que se marcó cada semana
let xmasShownMilestones = new Set();
let xmasConstancyShown = false;
const xmasMonths = [['AGOSTO', 4], ['SEPTIEMBRE', 4], ['OCTUBRE', 5], ['NOVIEMBRE', 4], ['DICIEMBRE', 5]];
const XMAS_START_DATE = new Date('2026-08-01T00:00:00');

function xmasWeekDueDate(weekNum) {
  const d = new Date(XMAS_START_DATE);
  d.setDate(d.getDate() + weekNum * 7 - 1);
  return d;
}

function buildXmas() {
  const container = document.getElementById('xmasWeeks');
  if (!container) return;
  container.innerHTML = '';
  let weekNum = 1;

  xmasMonths.forEach(([monthName, count]) => {
    const monthLabel = document.createElement('div');
    monthLabel.className = 'xmas-month-label';
    monthLabel.textContent = monthName;
    container.appendChild(monthLabel);

    for (let i = 0; i < count; i++) {
      const w = weekNum;
      const orn = document.createElement('div');
      orn.className = 'xmas-ornament';
      orn.id = `xorn-${w}`;
      orn.innerHTML = `<span class="week-num">S${w}</span>`;
      makeKeyboardActivatable(orn);
      orn.addEventListener('click', () => toggleXmasWeek(w));
      container.appendChild(orn);
      weekNum++;
    }
  });

  totalXmasWeeks = weekNum - 1;
  renderXmasProgress();
}

function toggleXmasWeek(w) {
  xmasChecked[w] = !xmasChecked[w];
  const orn = document.getElementById(`xorn-${w}`);
  if (orn) orn.classList.toggle('lit', xmasChecked[w]);

  if (xmasChecked[w]) {
    xmasCheckedAt[w] = new Date();
    checkCatchUp(w);
  } else {
    delete xmasCheckedAt[w];
  }

  renderXmasProgress();
  checkStreakMilestone();
  saveState();
}

// Si la semana que se marca ya venció hace más de 7 días Y la anterior
// seguía sin marcar, es señal de que se está poniendo al día de golpe.
function checkCatchUp(w) {
  if (w <= 1) return;
  const due = xmasWeekDueDate(w);
  const today = new Date();
  const daysOverdue = (today - due) / (1000 * 60 * 60 * 24);
  const prevWasUnmarkedUntilNow = !xmasChecked[w - 1];

  if (daysOverdue > 7 && prevWasUnmarkedUntilNow && !xmasConstancyShown) {
    xmasConstancyShown = true;
    showXmasMessage('Notamos que pusiste al día varias semanas de una sola vez — está bien, pasa. Pero el reto funciona mejor cuando separas el dinero semana a semana, no todo junto al final. Lo que construye el hábito es la constancia, no ponerte al día de golpe. 💪', 'constancy');
  }
}

// Racha continua desde la semana 1 (no cuenta total marcado).
function checkStreakMilestone() {
  let streak = 0;
  for (let w = 1; w <= totalXmasWeeks; w++) {
    if (xmasChecked[w]) streak++; else break;
  }

  const milestones = {
    5: '¡Arrancaste con todo! 🎉 5 semanas seguidas — ya el hábito se está agarrando.',
    10: 'Vas a la mitad del camino. 10 semanas cumplidas — tu Navidad ya se siente más cerca.',
    15: '15 semanas. Ya llevas más de lo que te falta — no aflojes ahora.',
    20: '20 semanas completas. Solo te faltan 2 para encender la estrella. 🌟'
  };

  if (milestones[streak] && !xmasShownMilestones.has(streak)) {
    xmasShownMilestones.add(streak);
    showXmasMessage(milestones[streak], 'milestone');
  }

  if (streak === totalXmasWeeks && totalXmasWeeks > 0) {
    const tree = document.getElementById('xmasTree');
    if (tree) tree.classList.add('lit');
    showXmasMessage('🌟 ¡Lo lograste! Completaste tu Reto Navideño con disciplina, semana a semana. Esto es tuyo — disfrútalo sin culpa.', 'milestone');
  } else {
    const tree = document.getElementById('xmasTree');
    if (tree) tree.classList.remove('lit');
  }
}

function showXmasMessage(text, type) {
  const box = document.getElementById('xmasStreakMsg');
  if (!box) return;
  box.textContent = text;
  box.className = 'xmas-streak-msg' + (type === 'constancy' ? ' constancy' : '');
  box.style.display = 'block';
}

function updateAllXmasLabels() {
  // Los ornamentos no muestran monto individual (solo el número de semana),
  // así que aquí solo se recalcula el progreso/meta general.
  renderXmasProgress();
}

function renderXmasProgress() {
  let saved = 0;
  for (let i = 1; i <= totalXmasWeeks; i++) {
    if (xmasChecked[i]) saved += i * xmasLevel;
  }
  const totalGoal = xmasLevel * ((totalXmasWeeks * (totalXmasWeeks + 1)) / 2);

  const progressNumEl = document.getElementById('xmasProgressNum');
  const progressLblEl = document.getElementById('xmasProgressLbl');
  const customMetaTag = document.getElementById('xmasCustomMetaTag');

  if (progressNumEl) progressNumEl.textContent = `RD$${fmt(saved)} de RD$${fmt(totalGoal)}`;
  if (customMetaTag) customMetaTag.textContent = `Meta: RD$${fmt(totalGoal)}`;

  if (progressLblEl) {
    const checkedCount = Object.values(xmasChecked).filter(Boolean).length;
    const weeksLeft = totalXmasWeeks - checkedCount;
    progressLblEl.textContent = saved > 0 ? `¡Sigue así! Te faltan ${weeksLeft} semanas` : 'Marca las semanas que ya depositaste';
  }
}

document.querySelectorAll('.xmas-level').forEach(el => {
  makeKeyboardActivatable(el);
  el.addEventListener('click', () => {
    const levelVal = el.dataset.level;
    const customRow = document.getElementById('xmasCustomInputRow');
    document.querySelectorAll('.xmas-level').forEach(l => l.classList.toggle('active', l === el));

    if (levelVal === 'custom') {
      if (customRow) customRow.style.display = 'block';
      const customInputEl = document.getElementById('xmasCustomAmount');
      xmasLevel = customInputEl ? (parseInt(customInputEl.value) || 0) : 0;
    } else {
      if (customRow) customRow.style.display = 'none';
      xmasLevel = parseInt(levelVal);
    }
    updateAllXmasLabels();
    saveState();
  });
});

const xmasCustomInput = document.getElementById('xmasCustomAmount');
if (xmasCustomInput) {
  xmasCustomInput.addEventListener('input', () => {
    xmasLevel = parseInt(xmasCustomInput.value) || 0;
    updateAllXmasLabels();
    saveState();
  });
}

/* ============ METAS & PROGRESO ============ */

// Convierte ingreso/gastos a su equivalente MENSUAL sin importar el
// periodo elegido en Presupuesto (mensual x1, quincenal x2).
function getMonthlyEquivalentIncome() {
  const v = getIncome();
  return budgetPeriod === 'quincenal' ? v * 2 : v;
}
function getMonthlyEquivalentExpenses() {
  const v = getTotalExpenses();
  return budgetPeriod === 'quincenal' ? v * 2 : v;
}

let emergencyAmount = 0;

document.querySelectorAll('.emergency-choice').forEach(btn => {
  makeKeyboardActivatable(btn);
  btn.addEventListener('click', () => {
    document.querySelectorAll('.emergency-choice').forEach(b => b.classList.toggle('active', b === btn));
    const customRow = document.getElementById('emergencyCustomRow');
    if (btn.dataset.amount === 'custom') {
      if (customRow) customRow.style.display = 'flex';
      const customInputEl = document.getElementById('emergencyCustomAmount');
      emergencyAmount = customInputEl ? (parseFloat(customInputEl.value) || 0) : 0;
    } else {
      if (customRow) customRow.style.display = 'none';
      emergencyAmount = parseFloat(btn.dataset.amount);
    }
    calculateEmergencyFund();
    saveState();
  });
});
const emergencyCustomAmountEl = document.getElementById('emergencyCustomAmount');
if (emergencyCustomAmountEl) {
  emergencyCustomAmountEl.addEventListener('input', () => {
    emergencyAmount = parseFloat(emergencyCustomAmountEl.value) || 0;
    calculateEmergencyFund();
    saveState();
  });
}

function calculateEmergencyFund() {
  const totalVal = document.getElementById('emergencyTotalVal');
  const refText = document.getElementById('emergencyRefText');
  if (!totalVal) return;
  totalVal.textContent = `RD$${fmt(emergencyAmount)}`;

  if (refText) {
    if (emergencyAmount > 0) {
      const monthlyExpenses = getMonthlyEquivalentExpenses();
      let msg = `Con RD$${fmt(emergencyAmount)}, ya tienes un colchón real para un imprevisto chico — un dolor de cabeza menos.`;
      if (monthlyExpenses > 0) {
        msg += ` La meta "de libro" son 3-6 meses de gastos (RD$${fmt(monthlyExpenses * 3)} a RD$${fmt(monthlyExpenses * 6)}) — pero eso se construye con el tiempo. Lo que ya separaste, ya cuenta.`;
      }
      refText.textContent = msg;
    } else {
      refText.textContent = '';
    }
  }
}

document.querySelectorAll('.icon-btn').forEach(btn => {
  makeKeyboardActivatable(btn);
  btn.addEventListener('click', () => {
    document.querySelectorAll('.icon-btn').forEach(b => b.classList.toggle('active', b === btn));
    selectedGoalIcon = btn.dataset.icon;
    calculateTargetGoal();
  });
});

function calculateTargetGoal() {
  const goalNameInp = document.getElementById('targetGoalName');
  const goalAmountInp = document.getElementById('targetGoalAmount');
  const goalMonthsInp = document.getElementById('targetGoalMonths');
  const coachBox = document.getElementById('coachAlertBox');
  const ahorroNote = document.getElementById('ahorroLinkNote');

  if (!goalAmountInp || !goalMonthsInp || !coachBox) return;

  const amount = parseFloat(goalAmountInp.value) || 0;
  const months = parseInt(goalMonthsInp.value) || 0;
  const name = goalNameInp ? goalNameInp.value.trim() : "";

  if (amount <= 0 || months <= 0) {
    coachBox.style.display = 'none';
    if (ahorroNote) ahorroNote.style.display = 'none';
    return;
  }

  const monthlySavingsRequired = amount / months;
  const income = getMonthlyEquivalentIncome();
  const expenses = getMonthlyEquivalentExpenses();
  const actualSavingsCapacity = income - expenses;
  const ahorroYaAsignado = amounts['ahorro'] || 0;

  if (ahorroNote) {
    if (ahorroYaAsignado > 0) {
      ahorroNote.style.display = 'block';
      ahorroNote.textContent = `Ya tienes RD$${fmt(ahorroYaAsignado)} separados en tu categoría de Ahorro — eso ya te acerca a esta meta.`;
    } else {
      ahorroNote.style.display = 'none';
    }
  }

  coachBox.style.display = 'block';
  const goalLabel = `${selectedGoalIcon} "${name || 'tu meta'}"`;

  if (monthlySavingsRequired > actualSavingsCapacity) {
    const deficit = monthlySavingsRequired - actualSavingsCapacity;
    coachBox.style.background = 'rgba(253, 140, 69, 0.08)';
    coachBox.style.color = '#B4432A';
    coachBox.style.border = '1px solid rgba(253, 140, 69, 0.3)';
    coachBox.innerHTML = `Para lograr <b>${goalLabel}</b> necesitas RD$${fmt(monthlySavingsRequired)}/mes. Hoy tu presupuesto te permite RD$${fmt(Math.max(0, actualSavingsCapacity))}/mes — te faltan RD$${fmt(deficit)}. No es un no, es un "todavía no": abajo tienes ideas reales para cerrar esa diferencia.`;
  } else {
    coachBox.style.background = 'var(--accent-soft)';
    coachBox.style.color = 'var(--accent-solid)';
    coachBox.style.border = '1px solid rgba(31, 122, 92, 0.2)';
    coachBox.innerHTML = `🎉 Con lo que ya ganas, <b>${goalLabel}</b> es alcanzable. Cada meta cumplida es más libertad para elegir.`;
  }
}

function renderBusinessCatalog() {
  const container = document.getElementById('ideasCatalogContainer');
  if (!container || container.children.length > 0) return;
  businessIdeas.forEach(idea => {
    const box = document.createElement('div');
    box.className = 'coach-idea-box';
    box.innerHTML = `<div class="coach-idea-title">${idea.title}</div><div class="coach-idea-desc">${idea.desc}</div>`;
    container.appendChild(box);
  });
}

// Botón "Ver tu AFP en la Academia" — cambia de pestaña y lleva la vista al card de AFP.
const afpLinkBtn = document.getElementById('afpLinkBtn');
if (afpLinkBtn) {
  afpLinkBtn.addEventListener('click', () => {
    const academiaNav = document.querySelector('.nav-item[data-tab="academia"]');
    if (academiaNav) academiaNav.click();
    setTimeout(() => {
      const afpCard = document.querySelector('.afp-card');
      if (afpCard) afpCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  });
}

['targetGoalAmount', 'targetGoalMonths', 'targetGoalName'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => { calculateTargetGoal(); saveState(); });
});

/* ============ RACHA SEMANAL (Pilar Presente) ============ */
const STREAK_HABITS = [
  { id: 'ahorro', text: 'Separé mi ahorro antes de gastar' },
  { id: 'impulso', text: 'Evité un gasto por impulso' },
  { id: 'plan', text: 'Revisé mi plan de la semana' }
];
let streakData = {}; // { 'YYYY-MM-DD' (lunes de esa semana): { ahorro:bool, impulso:bool, plan:bool } }

function getWeekKey(date) {
  const d = new Date(date || new Date());
  const day = d.getDay();
  const diffToMonday = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function buildStreakChecks() {
  const box = document.getElementById('streakChecks');
  if (!box) return;
  box.innerHTML = '';
  const weekKey = getWeekKey();
  if (!streakData[weekKey]) streakData[weekKey] = {};

  STREAK_HABITS.forEach(h => {
    const row = document.createElement('div');
    row.className = 'streak-check';
    row.innerHTML = `<span class="streak-check-box" id="streak-${h.id}"></span><span class="streak-check-text">${h.text}</span>`;
    makeKeyboardActivatable(row);
    row.addEventListener('click', () => {
      streakData[weekKey][h.id] = !streakData[weekKey][h.id];
      const box2 = document.getElementById(`streak-${h.id}`);
      if (box2) { box2.classList.toggle('checked', streakData[weekKey][h.id]); box2.textContent = streakData[weekKey][h.id] ? '✓' : ''; }
      renderStreakCounter();
      saveState();
    });
    box.appendChild(row);

    const boxEl = row.querySelector(`#streak-${h.id}`);
    if (streakData[weekKey][h.id]) { boxEl.classList.add('checked'); boxEl.textContent = '✓'; }
  });

  renderStreakCounter();
}

function weekFullyChecked(weekKey) {
  const w = streakData[weekKey];
  if (!w) return false;
  return STREAK_HABITS.every(h => w[h.id]);
}

function renderStreakCounter() {
  const counterEl = document.getElementById('streakCounter');
  if (!counterEl) return;

  let streak = 0;
  let cursor = getWeekKey();
  while (weekFullyChecked(cursor)) {
    streak++;
    const d = new Date(cursor);
    d.setDate(d.getDate() - 7);
    cursor = getWeekKey(d);
  }

  counterEl.textContent = streak > 0
    ? `🔥 Llevas ${streak} semana${streak === 1 ? '' : 's'} seguida${streak === 1 ? '' : 's'} cuidando tus cuartos.`
    : '🔥 Aún no empiezas tu racha esta semana.';
}

/* ============ SIMULADOR AFP ============ */
if (document.getElementById('afpSalario')) {
  document.getElementById('afpSalario').addEventListener('input', (e) => {
    const salario = parseFloat(e.target.value);
    const res = document.getElementById('afpSimResult');
    if (!res) return;
    if (!salario || salario <= 0) { res.classList.remove('show'); return; }
    res.innerHTML = `Tu retención mensual es de <b>RD$${fmt(salario * 0.0287)}</b>. Tu empleador aporta obligatoriamente otros <b>RD$${fmt(salario * 0.0710)}</b> adicionales.`;
    res.classList.add('show');
  });
}

/* ============ CRÉDITO INTELIGENTE ============ */
const CREDIT_BALANCE = 25000;
const CREDIT_APR = 0.52;
const creditSlider = document.getElementById('creditSlider');

function renderCreditSim() {
  if (!creditSlider) return;
  const pct = parseInt(creditSlider.value);
  const paid = Math.round(CREDIT_BALANCE * pct / 100);
  const remaining = CREDIT_BALANCE - paid;
  const interest = Math.round(remaining * CREDIT_APR / 12);

  const pctLabel = document.getElementById('creditPctLabel');
  const creditPaidEl = document.getElementById('creditPaid');
  const creditRemainingEl = document.getElementById('creditRemaining');
  const creditInterestEl = document.getElementById('creditInterest');
  if (pctLabel) pctLabel.textContent = `${pct}%`;
  if (creditPaidEl) creditPaidEl.textContent = `RD$${fmt(paid)}`;
  if (creditRemainingEl) creditRemainingEl.textContent = `RD$${fmt(remaining)}`;
  if (creditInterestEl) creditInterestEl.textContent = pct >= 100 ? 'RD$0' : `RD$${fmt(interest)}`;

  const tag = document.getElementById('creditTag');
  if (tag) {
    if (pct >= 100) { tag.textContent = 'Totalero — RD$0 en intereses'; tag.className = 'credit-slider-tag good'; }
    else if (pct >= 60) { tag.textContent = 'Buen avance'; tag.className = 'credit-slider-tag good'; }
    else if (pct >= 20) { tag.textContent = 'Riesgo moderado'; tag.className = 'credit-slider-tag warn'; }
    else { tag.textContent = 'La trampa del mínimo'; tag.className = 'credit-slider-tag bad'; }
  }
}
if (creditSlider) { creditSlider.addEventListener('input', renderCreditSim); renderCreditSim(); }

/* ============ NIÑOS ============ */
if (document.getElementById('kidsUnlockBtn')) {
  document.getElementById('kidsUnlockBtn').addEventListener('click', () => {
    const preview = document.getElementById('kidsPreview');
    const full = document.getElementById('kidsFull');
    const taskBox = document.getElementById('kidsTasks');
    if (preview) preview.style.display = 'none';
    if (full) full.classList.add('show');
    if (!taskBox) return;
    taskBox.innerHTML = '';
    kidsTasks.forEach(t => {
      const item = document.createElement('div');
      item.className = 'kids-task';
      item.innerHTML = `<span class="kids-task-check" id="kbox-${t.id}"></span><span class="kids-task-text">${t.text}</span>`;
      makeKeyboardActivatable(item);
      item.addEventListener('click', () => {
        kidsChecked[t.id] = !kidsChecked[t.id];
        const kbox = document.getElementById(`kbox-${t.id}`);
        if (kbox) { kbox.classList.toggle('checked', kidsChecked[t.id]); kbox.textContent = kidsChecked[t.id] ? '✓' : ''; }
        const done = Object.values(kidsChecked).filter(Boolean).length;
        const kidsProgress = document.getElementById('kidsProgress');
        if (kidsProgress) kidsProgress.textContent = `${done} de ${kidsTasks.length} retos completados`;
      });
      taskBox.appendChild(item);
    });
    lazyLoadVideos();
  });
}

/* ============ LECCIONES BLOQUEADAS ============ */
document.querySelectorAll('.course-item.locked').forEach(item => {
  makeKeyboardActivatable(item);
  item.addEventListener('click', () => {
    const titleEl = item.querySelector('.course-info-text b');
    const title = titleEl ? titleEl.textContent : 'Esta clase';
    alert(`"${title}" se desbloquea con tu compra.`);
  });
});

/* ============ PERSISTENCIA (localStorage) ============ */
const STORAGE_KEY = 'miscuartos_data_v1';

function saveState() {
  try {
    const data = {
      amounts,
      budgetPeriod,
      incomeValue: incomeEl ? incomeEl.value : '',
      xmasLevel,
      xmasChecked,
      xmasCheckedAt: Object.fromEntries(Object.entries(xmasCheckedAt).map(([k, v]) => [k, v.toISOString()])),
      xmasShownMilestones: Array.from(xmasShownMilestones),
      xmasConstancyShown,
      emergencyAmount,
      streakData,
      selectedGoalIcon,
      goalName: (document.getElementById('targetGoalName') || {}).value || '',
      goalAmount: (document.getElementById('targetGoalAmount') || {}).value || '',
      goalMonths: (document.getElementById('targetGoalMonths') || {}).value || ''
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Miscuartos: no se pudo guardar localmente.', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.amounts) amounts = data.amounts;
    if (data.budgetPeriod) budgetPeriod = data.budgetPeriod;
    if (data.xmasLevel != null) xmasLevel = data.xmasLevel;
    if (data.xmasChecked) xmasChecked = data.xmasChecked;
    if (data.xmasCheckedAt) {
      xmasCheckedAt = Object.fromEntries(Object.entries(data.xmasCheckedAt).map(([k, v]) => [k, new Date(v)]));
    }
    if (data.xmasShownMilestones) xmasShownMilestones = new Set(data.xmasShownMilestones);
    if (data.xmasConstancyShown) xmasConstancyShown = data.xmasConstancyShown;
    if (data.emergencyAmount != null) emergencyAmount = data.emergencyAmount;
    if (data.streakData) streakData = data.streakData;
    if (data.selectedGoalIcon) selectedGoalIcon = data.selectedGoalIcon;

    if (incomeEl && data.incomeValue) incomeEl.value = data.incomeValue;

    const goalNameEl = document.getElementById('targetGoalName');
    const goalAmountEl = document.getElementById('targetGoalAmount');
    const goalMonthsEl = document.getElementById('targetGoalMonths');
    if (goalNameEl && data.goalName) goalNameEl.value = data.goalName;
    if (goalAmountEl && data.goalAmount) goalAmountEl.value = data.goalAmount;
    if (goalMonthsEl && data.goalMonths) goalMonthsEl.value = data.goalMonths;
  } catch (e) {
    console.warn('Miscuartos: no se pudo cargar el guardado local.', e);
  }
}

function applyLoadedUIState() {
  // Periodo
  document.querySelectorAll('.period-btn').forEach(b => b.classList.toggle('active', b.dataset.period === budgetPeriod));
  applyPeriodLabels();
  const tip = document.getElementById('periodTip');
  if (tip) tip.style.display = budgetPeriod === 'quincenal' ? 'block' : 'none';

  // Reto Navideño: nivel activo
  const levelMatch = document.querySelector(`.xmas-level[data-level="${xmasLevel}"]`);
  document.querySelectorAll('.xmas-level').forEach(l => l.classList.remove('active'));
  if (levelMatch) {
    levelMatch.classList.add('active');
  } else {
    const customBtn = document.querySelector('.xmas-level[data-level="custom"]');
    if (customBtn) {
      customBtn.classList.add('active');
      const customRow = document.getElementById('xmasCustomInputRow');
      if (customRow) customRow.style.display = 'block';
      const customInputEl = document.getElementById('xmasCustomAmount');
      if (customInputEl) customInputEl.value = xmasLevel;
    }
  }

  // Colchón de paz: elección activa
  const emergencyMatch = document.querySelector(`.emergency-choice[data-amount="${emergencyAmount}"]`);
  document.querySelectorAll('.emergency-choice').forEach(b => b.classList.remove('active'));
  if (emergencyAmount > 0) {
    if (emergencyMatch) {
      emergencyMatch.classList.add('active');
    } else {
      const customBtn = document.querySelector('.emergency-choice[data-amount="custom"]');
      if (customBtn) {
        customBtn.classList.add('active');
        const customRow = document.getElementById('emergencyCustomRow');
        if (customRow) customRow.style.display = 'flex';
        const customInputEl = document.getElementById('emergencyCustomAmount');
        if (customInputEl) customInputEl.value = emergencyAmount;
      }
    }
  }

  // Ícono de meta activo
  document.querySelectorAll('.icon-btn').forEach(b => b.classList.toggle('active', b.dataset.icon === selectedGoalIcon));
}

/* ============ INICIALIZADOR SEGURO ============ */
const initApp = () => {
  loadState();
  Object.keys(categories).forEach(key => { if (amounts[key] == null) amounts[key] = 0; });
  buildLeaks();
  buildXmas();
  buildCategoryRows();
  buildStreakChecks();
  renderBusinessCatalog();
  calculateEmergencyFund();
  calculateTargetGoal();
  applyLoadedUIState();
  if (incomeEl) incomeEl.addEventListener('input', () => { updateTotals(true); saveState(); });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
