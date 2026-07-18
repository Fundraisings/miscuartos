/**
 * MISCUARTOS APP - SCRIPT PRINCIPAL COMPLETO (2026)
 * Contiene: Pantalla de inicio, navegación, presupuesto, reto navideño,
 * simulador AFP y los nuevos desplegables educativos del Coach.
 */

// --- 1. CONFIGURACIÓN DE DATOS GLOBALES ---
const CANASTA_BASICA_RD = 49268;

// --- 2. INICIALIZADOR DE LA APP (ARRANQUE) ---
document.addEventListener("DOMContentLoaded", () => {
  inicializarPantallaInicio();
  inicializarNavegacion();
  inicializarPresupuesto();
  inicializarRetoNavideno();
  inicializarSimuladorAFP();
  inicializarCreditoYOtros();
  inicializarMetasYEmprendimiento();
});

// --- 3. LOGICA PANTALLA DE INICIO (BOTÓN VERDE) ---
function inicializarPantallaInicio() {
  const enterAppBtn = document.getElementById("enterAppBtn");
  const splashScreen = document.getElementById("app-splash");
  const mainAppContainer = document.getElementById("mainAppContainer");

  if (enterAppBtn && splashScreen && mainAppContainer) {
    enterAppBtn.addEventListener("click", () => {
      splashScreen.style.display = "none";
      mainAppContainer.style.display = "block";
      // Inicializar cálculos por si acaso
      calcularPresupuestoInstantaneo();
    });
  }
}

// --- 4. CONTROL DE NAVEGACIÓN ENTRE PESTAÑAS ---
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
    row.style = "background: #fff; padding: 14px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #e1e6eb; display: flex; justify-content: space-between; align-items: center; gap: 12px;";
    row.innerHTML = `
      <label for="${cat.id}" style="font-size: 14px; font-weight: 500; color: #111;">${cat.label}</label>
      <div style="display: flex; align-items: center; gap: 4px;">
        <span style="font-weight: 600; color: #666;">RD$</span>
        <input type="number" id="${cat.id}" placeholder="${cat.placeholder}" inputmode="numeric" class="gastos-input" style="width: 100px; padding: 6px 10px; border: 1px solid #e1e6eb; border-radius: 8px; font-size: 14px; text-align: right; outline: none;">
      </div>
    `;
    resultsContainer.appendChild(row);
  });

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

  xmasWeeksContainer.innerHTML = "";
  for (let i = 1; i <= 22; i++) {
    const weekBox = document.createElement("div");
    weekBox.style = "display: inline-block; width: 45px; height: 45px; margin: 5px; line-height: 45px; text-align: center; border-radius: 8px; background: #FFF5EE; border: 1px solid #FD8C45; font-weight: 600; cursor: pointer; color: #111;";
    weekBox.textContent = i;
    weekBox.addEventListener("click", () => {
      weekBox.style.background = weekBox.style.background === "rgb(62, 156, 119)" ? "#FFF5EE" : "#3E9C77";
      weekBox.style.color = weekBox.style.background === "rgb(62, 156, 119)" ? "#fff" : "#111";
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

// --- 8. LÓGICA DE LA PESTAÑA: METAS Y ENFOQUE REDISEÑADO CON DESPLEGABLES ---
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
      if (gastosFijos <= 0) gastosFijos = 25000;

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

  const estiloSummary = "font-weight: 600; font-size: 14px; color: #111; cursor: pointer; padding: 12px; display: flex; justify-content: space-between; align-items: center; user-select: none; outline: none;";
  const estiloContenido = "padding: 0 12px 14px 12px; font-size: 13.5px; line-height: 1.5; color: #444; border-top: 1px dashed #e1e6eb; margin-top: 8px; pt: 8px;";
  const estiloDetails = "background: #fff; border: 1px solid #e1e6eb; border-radius: 10px; margin-bottom: 10px; overflow: hidden; transition: all 0.2s ease;";

  let mensajeHTML = `
    <div style="font-weight: 700; color: #111; margin-bottom: 12px; font-size: 15px; display: flex; align-items: center; gap: 6px;">
      📢 SUGERENCIAS DE TU COACH FINANCIERO
    </div>
    
    <div style="background: #F4F7f9; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid #2D8ACE; font-size: 14px;">
      Para lograr tu meta en el tiempo planeado, una buena referencia sería intentar separar unos 
      <strong style="color: #2D8ACE; font-size: 15px;">RD$ ${cuotaMensual.toLocaleString('es-DO', {maximumFractionDigits:2})}</strong> al mes.
    </div>

    <details style="${estiloDetails}">
      <summary style="${estiloSummary}">
        <span>⚠️ Un vistazo a la realidad (Punto A)</span>
        <span style="color: #999; font-size: 11px;">▼</span>
      </summary>
      <div style="${estiloContenido}">
        <p style="margin-top: 8px;">
          Alcanzar esta cifra puede ser retador, ya que tu ingreso actual se encuentra por debajo de la canasta básica familiar promedio en el país (RD$ ${CANASTA_BASICA_RD.toLocaleString()}).
        </p>
        <p style="margin-top: 6px;">
          Con el costo de productos esenciales en constante movimiento (como el pollo, el arroz o el aceite), es completamente normal sentir que el dinero rinde menos. ¡La calle tiene sus desafíos y no estás solo en esto!
        </p>
      </div>
    </details>

    <details style="${estiloDetails}">
      <summary style="${estiloSummary}">
        <span>🧠 Equilibrio de gastos (Punto B)</span>
        <span style="color: #999; font-size: 11px;">▼</span>
      </summary>
      <div style="${estiloContenido}">
        <p style="margin-top: 8px;">
          Una recomendación práctica para liberar algo de espacio en tus ingresos es cuidar los consumos impulsivos. 
        </p>
        <p style="margin-top: 6px;">
          A veces, el uso frecuente de tarjetas de crédito en salidas, "coros" o gastos del momento puede comprometer tu presupuesto sin que te des cuenta. Encontrar un balance te ayudará a avanzar más rápido hacia tus propósitos reales.
        </p>
      </div>
    </details>

    <details style="${estiloDetails}">
      <summary style="${estiloSummary}">
        <span>🛡️ Alternativas de ahorro (Punto C)</span>
        <span style="color: #999; font-size: 11px;">▼</span>
      </summary>
      <div style="${estiloContenido}">
        <p style="margin-top: 8px;">
          Aunque los métodos informales como los "sanes" o guardar efectivo en casa son herramientas muy comunes y tradicionales en nuestra cultura, considera que la inflación reduce el valor de ese dinero guardado día a día.
        </p>
        <p style="margin-top: 6px;">
          Evaluar opciones en instituciones bancarias reguladas puede ser una alternativa útil para proteger tus recursos de las alzas de precios y mantenerlos seguros.
        </p>
      </div>
    </details>

    <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #e1e6eb;">
      <p style="font-weight: 600; color: #111; line-height: 1.4; font-size: 14px; margin-bottom: 4px;">
        🚀 ¿Has pensado en generar un extra?
      </p>
      <p style="font-size: 13px; color: #666; line-height: 1.4; margin-bottom: 0;">
        Como recortar gastos a veces tiene un límite, explorar alternativas de micro-emprendimiento independiente es una excelente opción. Aquí abajo te compartimos algunas ideas comunes del mercado que podrían inspirarte:
      </p>
    </div>
  `;

  alertBox.innerHTML = mensajeHTML;
  alertBox.style.backgroundColor = '#FFFDF9';
  alertBox.style.border = '1px solid #E6D0B3';
  alertBox.style.padding = '16px';
  alertBox.style.borderRadius = '14px';

  entrepreneurshipModule.style.display = "block";
  renderizarIdeasDeEmprendimiento(cuotaMensual);
}

function renderizarIdeasDeEmprendimiento(cuotaNecesaria) {
  const container = document.getElementById("ideasCatalogContainer");
  if (!container) return;
  
  const ideas = [
    { titulo: "📸 Gestión de Redes para Negocios", desc: "Muchos salones o comercios locales necesitan apoyo digital. Manejar un par de cuentas de forma independiente podría aportar un estimado de...", ingreso: 10000 },
    { titulo: "🧁 Venta de Postres o Snacks", desc: "Preparar opciones bajo pedido para conocidos u oficinas los fines de semana suele generar ingresos extras de aproximadamente...", ingreso: 7500 },
    { titulo: "🚗 Tutorías o Asesorías", desc: "Compartir tus conocimientos en áreas como inglés, contabilidad o informática en tus tiempos libres puede sumarte un extra estimado de...", ingreso: 8000 }
  ];

  container.innerHTML = "";
  ideas.forEach(idea => {
    const card = document.createElement("div");
    card.style = "background: #fff; padding: 15px; border: 1px solid #e1e6eb; border-radius: 12px; display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;";
    
    const cubreMeta = idea.ingreso >= cuotaNecesaria;
    const badge = cubreMeta ? `<span style="background: #3E9C77; color: white; font-size: 10px; padding: 4px 8px; border-radius: 6px; font-weight: bold; width: fit-content; margin-bottom: 2px;">💡 IDEA RECOMENDADA</span>` : '';

    card.innerHTML = `
      ${badge}
      <div style="font-weight: 700; font-size: 14.5px; color: #111;">${idea.titulo}</div>
      <div style="font-size: 13px; color: #666; line-height: 1.4;">${idea.desc}</div>
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 700; color: #1F7A5C; margin-top: 4px; background: #E6F4EA; width: fit-content; padding: 2px 8px; border-radius: 4px;">
        Ingreso promedio del mercado: ~RD$ ${idea.ingreso.toLocaleString()} / mes
      </div>
    `;
    container.appendChild(card);
  });
}
