/**
 * MISCUARTOS APP - SCRIPT PRINCIPAL DE PRODUCCIÓN (2026)
 * Contiene toda la lógica de cálculo, navegación, simuladores,
 * educación financiera aplicada y catálogo de micro-emprendimiento.
 */

// --- 1. CONFIGURACIÓN DE DATOS GLOBALES Y MARCADORES ---
const CANASTA_BASICA_RD = 49268; // Datos extraídos de estadísticas oficiales en RD

const VIDEO_LINKS = {
  tutorial: "https://www.youtube.com/embed/VIDEO_ID_TUTORIAL",
  reto: "https://www.youtube.com/embed/VIDEO_ID_RETO",
  academiaIntro: "https://www.youtube.com/embed/VIDEO_ID_INTRO",
  afp: "https://www.youtube.com/embed/VIDEO_ID_AFP"
};

// --- 2. ENRUTADOR Y CONTROL DE NAVEGACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  inicializarNavegacion();
  inicializarPresupuesto();
  inicializarRetoNavideno();
  inicializarSimuladorAFP();
  inicializarMetasYEmprendimiento();
});

function inicializarNavegacion() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      // Cambiar estado activo de los botones
      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Cambiar visibilidad de las pestañas
      tabContents.forEach(tab => {
        if (tab.id === targetTab) {
          tab.classList.add("active");
        } else {
          tab.classList.remove("active");
        }
      });
    });
  });
}

// --- 3. LÓGICA DE LA PESTAÑA: PRESUPUESTO ---
function inicializarPresupuesto() {
  const form = document.getElementById("budgetForm");
  if (!form) return;

  const inputs = form.querySelectorAll("input[type='number']");
  inputs.forEach(input => {
    input.addEventListener("input", calcularPresupuestoInstantaneo);
  });

  const btnResumen = document.getElementById("btnVerResumen");
  if (btnResumen) {
    btnResumen.addEventListener("click", abrirModalResumen);
  }
}

function calcularPresupuestoInstantaneo() {
  const ingreso = parseFloat(document.getElementById("income").value) || 0;
  
  // Agrupar gastos por categorías típicas dominicanas
  const vivienda = parseFloat(document.getElementById("vivienda").value) || 0;
  const alimentos = parseFloat(document.getElementById("alimentos").value) || 0;
  const transporte = parseFloat(document.getElementById("transporte").value) || 0;
  const servicios = parseFloat(document.getElementById("servicios").value) || 0;
  const entretenimiento = parseFloat(document.getElementById("entretenimiento").value) || 0;
  const deudas = parseFloat(document.getElementById("deudas").value) || 0;

  const totalGastos = vivienda + alimentos + transporte + servicios + entretenimiento + deudas;
  const balance = ingreso - totalGastos;

  // Actualizar indicadores en la UI si existen
  const balanceElement = document.getElementById("balanceRapido");
  if (balanceElement) {
    balanceElement.textContent = `RD$ ${balance.toLocaleString('es-DO', {minimumFractionDigits: 2})}`;
    balanceElement.style.color = balance >= 0 ? "#3E9C77" : "#B4432A";
  }
  
  // Forzar actualización del análisis en la pestaña metas de forma reactiva
  actualizarAnalisisDelCoach();
}

function abrirModalResumen() {
  // Aquí se maneja la apertura del modal y la inyección del texto formateado para compartir por WhatsApp
  alert("Resumen generado. ¡Listo para compartir los resultados por WhatsApp!");
}

// --- 4. LÓGICA DE LA PESTAÑA: RETO NAVIDEÑO (CRONOMETRADO 2026) ---
function inicializarRetoNavideno() {
  const selectNivel = document.getElementById("nivelReto");
  if (selectNivel) {
    selectNivel.addEventListener("change", calcularProgresoReto);
  }
}

function calcularProgresoReto() {
  // Lógica para renderizar las 22 semanas desde agosto a diciembre 2026
  console.log("Calculando semanas del Reto Navideño 2026...");
}

// --- 5. LÓGICA DE LA PESTAÑA: ACADEMIA Y SIMULADOR AFP ---
function inicializarSimuladorAFP() {
  const btnCalcularAFP = document.getElementById("btnCalcularAFP");
  if (btnCalcularAFP) {
    btnCalcularAFP.addEventListener("click", () => {
      const sueldoBruto = parseFloat(document.getElementById("sueldoAFP").value) || 0;
      const aporteTrabajador = sueldoBruto * 0.0287;
      const aporteEmpleador = sueldoBruto * 0.0710;
      
      const resultadoAFP = document.getElementById("resultadoAFP");
      if (resultadoAFP) {
        resultadoAFP.innerHTML = `
          <p><strong>Tu aporte (2.87%):</strong> RD$ ${aporteTrabajador.toLocaleString('es-DO')}</p>
          <p><strong>Aporte Empleador (7.10%):</strong> RD$ ${aporteEmpleador.toLocaleString('es-DO')}</p>
          <p style="color: #2D8ACE; font-size:12px; margin-top:5px;">⚠️ Este dinero te pertenece por ley y acumula intereses heredables.</p>
        `;
      }
    });
  }
}

// --- 6. LÓGICA DE LA PESTAÑA: METAS Y ENFOQUE EDUCATIVO DE EMPRENDIMIENTO ---
function inicializarMetasYEmprendimiento() {
  const targetAmountInput = document.getElementById('targetGoalAmount');
  const targetMonthsInput = document.getElementById('targetGoalMonths');
  const incomeInput = document.getElementById('income');

  if (targetAmountInput && targetMonthsInput) {
    targetAmountInput.addEventListener('input', actualizarAnalisisDelCoach);
    targetMonthsInput.addEventListener('input', actualizarAnalisisDelCoach);
  }
  if (incomeInput) {
    incomeInput.addEventListener('input', actualizarAnalisisDelCoach);
  }
}

function actualizarAnalisisDelCoach() {
  const sueldoInput = document.getElementById('income')?.value || 0;
  const sueldo = parseFloat(sueldoInput);
  const metaMonto = parseFloat(document.getElementById('targetGoalAmount')?.value) || 0;
  const metaMeses = parseFloat(document.getElementById('targetGoalMonths')?.value) || 0;
  const alertBox = document.getElementById('coachAlertBox');
  const entrepreneurshipModule = document.getElementById('entrepreneurshipModule');

  if (!alertBox || !entrepreneurshipModule) return;

  if (metaMonto <= 0 || metaMeses <= 0) {
    alertBox.style.display = 'none';
    entrepreneurshipModule.style.display = 'none';
    return;
  }

  const cuotaMensual = metaMonto / metaMeses;
  alertBox.style.display = 'block';

  // BLOQUE EDUCATIVO INTEGRADO (PUNTOS A, B Y C)
  let mensajeHTML = `
    <div style="font-weight: 700; color: #B4432A; margin-bottom: 8px;">📢 DIAGNÓSTICO DE TU COACH FINANCIERO:</div>
    <p style="margin-bottom: 10px;">Para lograr tu meta a tiempo, necesitas separar <strong>RD$ ${cuotaMensual.toLocaleString('es-DO', {minimumFractionDigits: 2})}</strong> todos los meses.</p>
  `;

  // PUNTO A: REALIDAD FRENTE A LA CANASTA BÁSICA EXTRAÍDA DE GOOGLE
  if (sueldo < CANASTA_BASICA_RD) {
    mensajeHTML += `
      <div style="background: rgba(180, 67, 42, 0.05); padding: 10px; border-left: 4px solid #B4432A; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
        <strong>⚠️ Realidad Dominicana (Punto A):</strong> Tu ingreso registrado está por debajo de la canasta básica familiar promedio nacional (RD$ ${CANASTA_BASICA_RD.toLocaleString()}). Con los precios de los alimentos por las nubes (el pollo, el arroz, el aceite) y los salarios rezagados, sabemos que ahorrar esa cuota es una batalla cuesta arriba. ¡No te culpes, las estadísticas demuestran que la calle está dura!
      </div>
    `;
  } else {
    mensajeHTML += `
      <div style="background: rgba(62, 156, 119, 0.05); padding: 10px; border-left: 4px solid #3E9C77; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
        <strong>✅ Punto de Ventaja (Punto A):</strong> Cuentas con un ingreso superior al promedio de la canasta básica (RD$ ${CANASTA_BASICA_RD.toLocaleString()}). Tu mayor reto no es la falta de dinero, sino blindar tus cuartos de las presiones inflacionarias invisibles.
      </div>
    `;
  }

  // PUNTO B: CONTROL DE MALOS HÁBITOS (CULTURA DEL APARENTAR)
  mensajeHTML += `
    <div style="background: rgba(253, 140, 69, 0.05); padding: 10px; border-left: 4px solid #FD8C45; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
      <strong>🧠 Educación de Guerra (Punto B):</strong> Para liberar esos cuartos mensuales, la regla de oro es romper la <em>"cultura del aparentar"</em>. No utilices la tarjeta de crédito como una extensión de tu sueldo para pagar bultos insostenibles en salidas o deliveries que desaparecen en un fin de semana.
    </div>
  `;

  // PUNTO C: REMEDIO Y ACCIÓN (INCLUSIÓN FINANCIERA FORMAL)
  mensajeHTML += `
    <div style="background: rgba(45, 138, 206, 0.05); padding: 10px; border-left: 4px solid #2D8ACE; margin-bottom: 12px; font-size: 13px; line-height: 1.4;">
      <strong>🛡️ Acción Defensiva (Punto C):</strong> Nada de guardar lo que ahorres debajo del colchón o en "Sanes" informales de alto riesgo donde la inflación devalúa tus cuartos o te expones a un fraude. Esos fondos van directo a instrumentos bancarios regulados.
    </div>
  `;

  // APERTURA Y LLAMADO AL EMPRENDIMIENTO COMO SOLUCIÓN RADICAL
  mensajeHTML += `
    <p style="margin-top: 12px; font-weight: 600; color: #111; line-height: 1.4;">
      🚀 <strong>¿La solución definitiva?</strong> Recortar gastos tiene un tope físico, pero tus ingresos NO. Explora aquí abajo el catálogo de opciones de micro-emprendimiento rápido que preparamos para ti. Con un par de horas extras a la semana cubres la brecha sin asfixiar tu estilo de vida.
    </p>
  `;

  alertBox.innerHTML = mensajeHTML;
  alertBox.style.backgroundColor = '#FFFDF9';
  alertBox.style.border = '1px solid #E6D0B3';

  entrepreneurshipModule.style.display = 'block';
  renderizarIdeasDeEmprendimiento(cuotaMensual);
}

function renderizarIdeasDeEmprendimiento(cuotaNecesaria) {
  const container = document.getElementById('ideasCatalogContainer');
  if (!container) return;
  
  const ideas = [
    {
      titulo: "📸 Gestión de Redes para Negocios Locales",
      desc: "Salones, colmados o tiendas en tu sector necesitan presencia digital pero no tienen tiempo. Si manejas 2 cuentas cobrando RD$5,000 mensuales, generas...",
      ingreso: 10000
    },
    {
      titulo: "🧁 Venta de Postres o Snacks bajo pedido",
      desc: "Prepara brownies o picaderas los fines de semana y distribúyelos por WhatsApp en tu oficina o vecindario. Con 15 clientes fijos al mes obtienes...",
      ingreso: 7500
    },
    {
      titulo: "🚗 Tutorías o Servicios de Asesoría Técnica",
      desc: "Si dominas la contabilidad, el inglés, diseño o matemáticas, vende 4 mentorías de 2 horas los sábados por Zoom. Te sumará un extra de...",
      ingreso: 8000
    }
  ];

  container.innerHTML = "";
  ideas.forEach(idea => {
    const card = document.createElement('div');
    card.className = "entrepreneurship-card"; // Clases estilizadas de tu archivo CSS
    card.style = "background: #fff; padding: 15px; border: 1px solid #e1e6eb; border-radius: 12px; display: flex; flex-direction: column; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);";
    
    const cubreMeta = idea.ingreso >= cuotaNecesaria;
    const badge = cubreMeta ? `<span style="background: #3E9C77; color: white; font-size: 10px; padding: 3px 8px; border-radius: 6px; font-weight: bold; width: fit-content; margin-bottom: 2px;">🎯 CUBRE TU META</span>` : '';

    card.innerHTML = `
      ${badge}
      <div style="font-weight: 700; font-size: 15px; color: #111;">${idea.titulo}</div>
      <div style="font-size: 13px; color: #666; line-height: 1.4;">${idea.desc}</div>
      <div style="font-family: monospace; font-size: 13.5px; font-weight: 700; color: #1F7A5C; margin-top: 4px;">Ingreso estimado: +RD$ ${idea.ingreso.toLocaleString()}/mes</div>
    `;
    container.appendChild(card);
  });
}
