/**
 * MISCUARTOS APP - SCRIPT PRINCIPAL DE PRODUCCIÓN (2026)
 * Contiene toda la lógica de la pantalla de inicio, navegación,
 * presupuesto, reto navideño, simuladores y metas con enfoque educativo.
 */

// --- 1. CONFIGURACIÓN DE DATOS GLOBALES ---
const CANASTA_BASICA_RD = 49268;

// --- 2. INICIALIZADOR DE LA APP ---
document.addEventListener("DOMContentLoaded", () => {
  inicializarPantallaInicio();
  inicializarNavegacion();
  inicializarPresupuesto();
  inicializarRetoNavideno();
  inicializarSimuladorAFP();
  inicializarCreditoYOtros();
  inicializarMetasYEmprendimiento();
});

// --- 3. LOGICA PANTALLA DE INICIO (SPLASH SCREEN) ---
function inicializarPantallaInicio() {
  const enterAppBtn = document.getElementById("enterAppBtn");
  const splashScreen = document.getElementById("app-splash");
  const mainAppContainer = document.getElementById("mainAppContainer");

  if (enterAppBtn && splashScreen && mainAppContainer) {
    enterAppBtn.addEventListener("click", () => {
      splashScreen.style.display = "none";
      mainAppContainer.style.display = "block";
      // Forzar recálculo inicial por si hay datos precargados
      calcularPresupuestoInstantaneo();
    });
  }
}

// --- 4. ENRUTADOR Y CONTROL DE NAVEGACIÓN ---
function inicializarNavegacion() {
  const navButtons = document.querySelectorAll(".nav-item");
  const tabPanes = document.querySelectorAll(".tab-pane");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      // Cambiar estado activo de los botones inferiores
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Cambiar visibilidad de las pestañas de contenido
      tabPanes.forEach(pane => {
        if (pane.id === `pane-${targetTab}`) {
          pane.classList.add("active");
        } else {
          pane.classList.remove("active");
        }
      });
    });
  });
}

// --- 5. LÓGICA DE LA PESTAÑA: PRESUPUESTO ---
function inicializarPresupuesto() {
  const incomeInput = document.getElementById("income");
  if (incomeInput) {
    incomeInput.addEventListener("input", () => {
      calcularPresupuestoInstantaneo();
      actualizarAnalisisDelCoach();
    });
  }

  // Renderizar las casillas dinámicas dentro del contenedor #results
  renderizarCamposPresupuesto();
}

function renderizarCamposPresupuesto() {
  const resultsContainer = document.getElementById("results");
  if (!resultsContainer) return;

  const categorias = [
    { id: "vivienda", label: "🏠 Vivienda y Alquiler", placeholder: "Ej. 15,000" },
    { id: "alimentos", label: "🛒 Súper y Comida (Canasta básica)", placeholder: "Ej. 12,000" },
    { id: "transporte", label: "🚗 Gasolina, Concho o Mototaxi", placeholder: "Ej. 4,000" },
    { id: "servicios", label: "⚡ Luz, Agua, Internet y celular", placeholder: "Ej. 3,500" },
    { id: "entretenimiento", label: "🍗 Salidas, Coros y Delivery", placeholder: "Ej. 3,000" },
    { id: "deudas", label: "💳 Tarjetas y Préstamos", placeholder: "Ej. 5,000" }
  ];

  resultsContainer.innerHTML = "";
  categorias.forEach(cat => {
    const row = document.createElement("div");
    row.style = "background: var(--bg-card, #fff); padding: 14px; border-radius: 12px; margin-bottom: 12px; border: 1px solid var(--line, #e1e6eb); display: flex; justify-content: space-between; align-items: center; gap: 12px;";
    row.innerHTML = `
      <label for="${cat.id}" style="font-size: 14px; font-weight: 500; color: var(--ink, #111);">${cat.label}</label>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-weight: 600; color: var(--muted, #666);">RD$</span>
        <input type="number" id="${cat.id}" placeholder="${cat.placeholder}" inputmode="numeric" class="gastos-input" style="width: 100px; padding: 6px 10px; border: 1px solid var(--line, #e1e6eb); border-radius: 8px; font-size: 14px; text-align: right; outline: none;">
      </div>
    `;
    resultsContainer.appendChild(row);
  });

  // Escuchar cambios en los nuevos inputs generados
  document.querySelectorAll(".gastos-input").forEach(input => {
    input.addEventListener("input", () => {
      calcularPresupuestoInstantaneo();
      actualizarAnalisisDelCoach();
    });
  });
}

function calcularPresupuestoInstantaneo() {
  let totalGastos = 0;
  let camposConMonto = 0;

  document.querySelectorAll(".gastos-input").forEach(input => {
    const valor = parseFloat(input.value) || 0;
    if (valor > 0) {
      totalGastos += valor;
      camposConMonto++;
    }
  });

  const countTag = document.getElementById("countTag");
  if (countTag) {
    countTag.textContent = `${camposConMonto} con monto`;
  }

  return totalGastos;
}

// --- 6. LÓGICA DE LA PESTAÑA: RETO NAVIDEÑO 2026 ---
function inicializarRetoNavideno() {
  const xmasWeeksContainer = document.getElementById("xmasWeeks");
  if (!xmasWeeksContainer) return;

  // Renderizar las 22 semanas de agosto a diciembre de 2026
  xmasWeeksContainer.innerHTML = "";
  for (let i = 1; i <= 22; i++) {
    const weekBox = document.createElement("div");
    weekBox.style = "display: inline-block; width: 45px; height: 45px; margin: 5px; line-height: 45px; text-align: center; border-radius: 8px; background: #FFF5EE; border: 1px solid #FD8C45; font-weight: 600; cursor: pointer; color: #111;";
    weekBox.textContent = i;
    weekBox.addEventListener("click", () => {
      weekBox.style.background = weekBox.style.background === "rgb(62, 156, 119)" ? "#FFF5EE" : "#3E9C77";
      weekBox.style.color = weekBox.style.background === "rgb(62, 156, 119)" ? "#fff" : "#111";
      // Actualizar progreso simulado
      const progresoNum = document.getElementById("xmasProgressNum");
      if (progresoNum) progresoNum.textContent = "¡Progreso actualizado con éxito!";
    });
    xmasWeeksContainer.appendChild(weekBox);
  }
}

// --- 7. LÓGICA DE LA PESTAÑA: ACADEMIA Y SIMULADORES ---
function inicializarSimuladorAFP() {
  const afpSalario = document.getElementById("afpSalario");
  if (afpSalario) {
    afpSalario.addEventListener("input", () => {
      const sueldo = parseFloat(afpSalario.value) || 0;
      const tuAporte = sueldo * 0.0287;
      const resultado = document.getElementById("afpSimResult");
      if (resultado) {
        resultado.innerHTML = `Tu aporte mensual obligado (2.87%): <strong style="color: #FD8C45;">RD$ ${tuAporte.toLocaleString('es-DO', {maximumFractionDigits:2})}</strong><br><span style="font-size:11px; color:#666;">Tu empleador aporta otro 7.10% en segundo plano.</span>`;
      }
    });
  }
}

function inicializarCreditoYOtros() {
  const creditSlider = document.getElementById("creditSlider");
  if (creditSlider) {
    creditSlider.addEventListener("input", () => {
      const val = creditSlider.value;
      const paid = document.getElementById("creditPaid");
      const label = document.getElementById("creditPctLabel");
      if (label) label.textContent = `${val}%`;
      if (paid) paid.textContent = `RD$ ${(25000 * (val/100)).toLocaleString('es-DO')}`;
    });
  }
}

// --- 8. LÓGICA DE LA PESTAÑA: METAS Y ENFOQUE EDUCATIVO ---
function inicializarMetasYEmprendimiento() {
  const targetAmount = document.getElementById("targetGoalAmount");
  const targetMonths = document.getElementById("targetGoalMonths");
  const emergencySlider = document.getElementById("emergencySlider");

  if (targetAmount) targetAmount.addEventListener("input", actualizarAnalisisDelCoach);
  if (targetMonths) targetMonths.addEventListener("input", actualizarAnalisisDelCoach);
  
  if (emergencySlider) {
    emergencySlider.addEventListener("input", () => {
      const meses = emergencySlider.value;
      const label = document.getElementById("emergencyMonthsLabel");
      const totalVal = document.getElementById("emergencyTotalVal");
      
      let gastosFijos = calcularPresupuestoInstantaneo();
      if (gastosFijos <= 0) gastosFijos = 25000; // Backup si no han llenado presupuesto

      if (label) label.textContent = `${meses} meses`;
      if (totalVal) totalVal.textContent = `RD$ ${(gastosFijos * meses).toLocaleString('es-DO')}`;
    });
  }
}

function actualizarAnalisisDelCoach() {
  const sueldo = parseFloat(document.getElementById("income").value) || 0;
  const metaMonto = parseFloat(document.getElementById("targetGoalAmount").value) || 0;
  const metaMeses = parseFloat(document.getElementById("targetGoalMonths").value) || 0;
  
  const alertBox = document.getElementById("coachAlertBox");
  const entrepreneurshipModule = document.getElementById("entrepreneurshipModule");

  if (!alertBox || !entrepreneurshipModule) return;

  if (metaMonto <= 0 || metaMeses <= 0) {
    alertBox.style.display = "none";
    entrepreneurshipModule.style.display = "none";
    return;
  }

  const cuotaMensual = metaMonto / metaMeses;
  alertBox.style.display = "block";

  let mensajeHTML = `
    <div style="font-weight: 700; color: #B4432A; margin-bottom: 8px;">📢 DIAGNÓSTICO DE TU COACH FINANCIERO:</div>
    <p style="margin-bottom: 10px;">Para lograr tu meta a tiempo, necesitas separar <strong>RD$ ${cuotaMensual.toLocaleString('es-DO', {maximumFractionDigits:2})}</strong> todos los meses.</p>
  `;

  // PUNTO A: REALIDAD FRENTE A LA CANASTA BÁSICA
  if (sueldo < CANASTA_BASICA_RD) {
    mensajeHTML += `
      <div style="background: rgba(180, 67, 42, 0.05); padding: 10px; border-left: 4px solid #B4432A; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
        <strong>⚠️ Realidad Dominicana (Punto A):</strong> Tu ingreso está por debajo de la canasta básica familiar promedio nacional (RD$ ${CANASTA_BASICA_RD.toLocaleString()}). Con los alimentos por las nubes (el pollo, el arroz, el aceite), sabemos que ahorrar esa cuota es una batalla cuesta arriba. ¡No te culpes, la calle está dura!
      </div>
    `;
  } else {
    mensajeHTML += `
      <div style="background: rgba(62, 156, 119, 0.05); padding: 10px; border-left: 4px solid #3E9C77; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
        <strong>✅ Punto de Ventaja (Punto A):</strong> Cuentas con un ingreso superior al promedio de la canasta básica (RD$ ${CANASTA_BASICA_RD.toLocaleString()}). Tu reto es blindar tus cuartos frente a la inflación.
      </div>
    `;
  }

  // PUNTO B: CONTROL DE MALOS HÁBITOS
  mensajeHTML += `
    <div style="background: rgba(253, 140, 69, 0.05); padding: 10px; border-left: 4px solid #FD8C45; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
      <strong>🧠 Educación de Guerra (Punto B):</strong> Para liberar esos cuartos, rompe la <em>"cultura del aparentar"</em>. No uses la tarjeta como extensión de sueldo para pagar bultos en salidas que desaparecen en un fin de semana.
    </div>
  `;

  // PUNTO C: INCLUSIÓN FINANCIERA FORMAL
  mensajeHTML += `
    <div style="background: rgba(45, 138, 206, 0.05); padding: 10px; border-left: 4px solid #2D8ACE; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
      <strong>🛡️ Acción Defensiva (Punto C):</strong> Nada de guardar tus ahorros bajo el colchón o en "Sanes" informales peligrosos. El dinero se guarda en instrumentos bancarios regulados en RD.
    </div>
  `;

  mensajeHTML += `
    <p style="margin-top: 12px; font-weight: 600; color: #111; line-height: 1.4;">
      🚀 <strong>¿La solución definitiva?</strong> Como recortar gastos tiene un tope, mira abajo las opciones de micro-emprendimiento rápido que preparamos para ti para cubrir esta brecha sin asfixiarte.
    </p>
  `;

  alertBox.innerHTML = mensajeHTML;
  alertBox.style.backgroundColor = '#FFFDF9';
  alertBox.style.border = '1px solid #E6D0B3';

  entrepreneurshipModule.style.display = "block";
  renderizarIdeasDeEmprendimiento(cuotaMensual);
}

function renderizarIdeasDeEmprendimiento(cuotaNecesaria) {
  const container = document.getElementById("ideasCatalogContainer");
  if (!container) return;
  
  const ideas = [
    { titulo: "📸 Gestión de Redes para Negocios Locales", desc: "Salones o colmados necesitan presencia digital. Si manejas 2 cuentas cobrando RD$5,000, generas...", ingreso: 10000 },
    { titulo: "🧁 Venta de Postres bajo pedido", desc: "Prepara brownies o picaderas y distribúyelos por WhatsApp en tu oficina o vecindario.", ingreso: 7500 },
    { titulo: "🚗 Tutorías o Asesorías Técnicas", desc: "Vende mentorías de lo que domines (inglés, matemáticas, contabilidad) los sábados por Zoom.", ingreso: 8000 }
  ];

  container.innerHTML = "";
  ideas.forEach(idea => {
    const card = document.createElement("div");
    card.style = "background: #fff; padding: 15px; border: 1px solid #e1e6eb; border-radius: 12px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;";
    
    const cubreMeta = idea.ingreso >= cuotaNecesaria;
    const badge = cubreMeta ? `<span style="background: #3E9C77; color: white; font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: bold; width: fit-content;">🎯 CUBRE TU META</span>` : '';

    card.innerHTML = `
      ${badge}
      <div style="font-weight: 700; font-size: 15px; color: #111;">${idea.titulo}</div>
      <div style="font-size: 13px; color: #666; line-height: 1.4;">${idea.desc}</div>
      <div style="font-family: monospace; font-size: 13.5px; font-weight: 700; color: #1F7A5C; margin-top: 4px;">Ingreso estimado: +RD$ ${idea.ingreso.toLocaleString()}/mes</div>
    `;
    container.appendChild(card);
  });
}
