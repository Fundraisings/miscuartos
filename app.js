// =========================================================================
// ARCHIVO: app.js (Código Completo Consolidado)
// =========================================================================

// --- VARIABLES Y CONSTANTES GLOBALES ---
const CANASTA_BASICA_RD = 45000;

// --- INICIALIZADOR PRINCIPAL AL CARGAR EL DOCUMENTO ---
document.addEventListener("DOMContentLoaded", () => {
  configurarNavegacionPestañas();
  inicializarFormularioIngresos();
  inicializarSimuladorAFP();
  inicializarMetasYEmprendimiento();
});

// =========================================================================
// --- 1. SISTEMA DE NAVEGACIÓN ENTRE PESTAÑAS ---
// =========================================================================
function configurarNavegacionPestañas() {
  const enlacesPestañas = document.querySelectorAll(".tab-link");
  const contenidosPestañas = document.querySelectorAll(".tab-content");

  enlacesPestañas.forEach(enlace => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      const destinoId = enlace.getAttribute("data-tab");

      // Cambiar estado activo en botones
      enlacesPestañas.forEach(btn => btn.classList.remove("active"));
      enlace.classList.add("active");

      // Cambiar visibilidad de las secciones
      contenidosPestañas.forEach(seccion => {
        if (seccion.id === destinoId) {
          seccion.style.display = "block";
        } else {
          seccion.style.display = "none";
        }
      });
    });
  });
}

// =========================================================================
// --- 2. GESTIÓN DE INGRESOS Y PRESUPUESTO AUXILIAR ---
// =========================================================================
function inicializarFormularioIngresos() {
  const inputIncome = document.getElementById("income");
  if (inputIncome) {
    inputIncome.addEventListener("input", () => {
      // Al cambiar el ingreso, se recalcula el análisis del coach automáticamente
      actualizarAnalisisDelCoach();
    });
  }
}

// Función auxiliar para deducir gastos aproximados si no se han completado aún
function calcularPresupuestoInstantaneo() {
  const sueldo = parseFloat(document.getElementById("income").value) || 0;
  // Suposición financiera: un usuario promedio consume un 70% de su ingreso en gastos fijos
  return sueldo > 0 ? sueldo * 0.70 : 0;
}

// =========================================================================
// --- 9. LÓGICA DE LA PESTAÑA: ACADEMIA Y SIMULADORES INTERACTIVOS ---
// =========================================================================
function inicializarDineroOculto() {
  // Eliminado de la academia para mantenerla limpia y enfocada puramente en enseñar.
  // La lógica de Dinero Oculto ahora vive de forma estratégica dentro de las Metas Financieras.
}

function inicializarSimuladorAFP() {
  const academiaIntroBox = document.getElementById("academiaIntroMessage");
  if (academiaIntroBox) {
    academiaIntroBox.innerHTML = `
      <div style="background: linear-gradient(135deg, #1F7A5C, #143D31); color: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 15px rgba(20,61,49,0.2); margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; letter-spacing: -0.3px;">🎓 Academia MisCuartos</h3>
        <p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.45; opacity: 0.95;">
          Domina el uso de herramientas financieras interactivas y acelera el control de tu dinero. Comienza viendo nuestra clase introductoria para organizar tus cuentas desde hoy; las pautas clave para registrarte y expandir tus conocimientos hacia los siguientes niveles están detalladas directamente en el contenido del video.
        </p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-weight: 600;">⏱️ Clases Cortas</span>
          <span style="font-size: 12px; background: rgba(255,255,255,0.2); padding: 4px 10px; border-radius: 20px; font-weight: 600;">🛠️ Enfoque Práctico</span>
        </div>
      </div>
    `;
  }

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

// =========================================================================
// --- 10. LÓGICA DE LA PESTAÑA: METAS Y ENFOQUE CON DINERO OCULTO INTEGRADO ---
// =========================================================================
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
  const estiloContenido = "padding: 0 12px 14px 12px; font-size: 13.5px; line-height: 1.5; color: #444; border-top: 1px dashed #e1e6eb; margin-top: 8px; padding-top: 8px;";
  const estiloDetails = "background: #fff; border: 1px solid #e1e6eb; border-radius: 10px; margin-bottom: 10px; overflow: hidden; transition: all 0.2s ease;";

  let mensajeHTML = `
    <div style="font-weight: 700; color: #111; margin-bottom: 12px; font-size: 15px; display: flex; align-items: center; gap: 6px;">
      📢 SUGERENCIAS DE TU COACH FINANCIERO
    </div>
    
    <div style="background: #F4F7f9; padding: 12px; border-radius: 8px; margin-bottom: 8px; border-left: 4px solid #2D8ACE; font-size: 14px;">
      Para lograr tu meta en el tiempo planeado, necesitas separar unos 
      <strong style="color: #2D8ACE; font-size: 15px;">RD$ ${cuotaMensual.toLocaleString('es-DO', {maximumFractionDigits:2})}</strong> al mes.
    </div>

    <div style="background: #FFF9E6; border: 1px solid #FFEAA7; color: #D6A21E; padding: 10px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; text-align: left; line-height: 1.4;">
      💡 Tip de Compromiso: Abre una cuenta de ahorro aparte. Dinero que entra ahí no se toca hasta cumplir el plazo, salvo una emergencia real.
    </div>

    <!-- 🔍 INTEGRACIÓN ESTRATÉGICA: DINERO OCULTO EN METAS -->
    <div style="background: #FFFDF0; border: 1px solid #F3E1B6; padding: 16px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
      <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #8A6D1C; font-weight: 700;">🔍 ¿DE DÓNDE SACAR ESE DINERO? ENCUENTRA TU DINERO OCULTO</h4>
      <p style="margin: 0 0 12px 0; font-size: 12.5px; color: #555; line-height: 1.4;">
        Antes de pensar que no te alcanza, evalúa tus consumos cotidianos. Al descubrir y ajustar estos gastos ocultos, liberarás el dinero necesario para cubrir tu cuota mensual de ahorro:
      </p>
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <!-- Hábito 1 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e1e6eb;">
          <label style="font-size: 12.5px; font-weight: 600; color: #222;">☕ Cafecito o empanada en la calle</label>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span style="font-size: 11px; color: #666;">Costo apróx: RD$ 150</span>
            <select class="input-habito-meta" data-costo="150" data-tipo="semanal" style="padding: 4px; border-radius: 6px; border: 1px solid #ced4da; font-size: 12px; background: #f8f9fa; font-weight: 600;">
              <option value="0">Nunca</option>
              <option value="1">1 vez x semana</option>
              <option value="3">3 veces x semana</option>
              <option value="5">5 veces x semana</option>
            </select>
          </div>
        </div>

        <!-- Hábito 2 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e1e6eb;">
          <label style="font-size: 12.5px; font-weight: 600; color: #222;">🍗 Delivery de cena por antojo</label>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span style="font-size: 11px; color: #666;">Costo apróx: RD$ 600</span>
            <select class="input-habito-meta" data-costo="600" data-tipo="semanal" style="padding: 4px; border-radius: 6px; border: 1px solid #ced4da; font-size: 12px; background: #f8f9fa; font-weight: 600;">
              <option value="0">Nunca</option>
              <option value="1">1 vez x semana</option>
              <option value="3">3 veces x semana</option>
            </select>
          </div>
        </div>

        <!-- Hábito 3 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e1e6eb;">
          <label style="font-size: 12.5px; font-weight: 600; color: #222;">📺 Suscripción de streaming sin usar</label>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span style="font-size: 11px; color: #666;">Costo fijo: RD$ 550 / mes</span>
            <select class="input-habito-meta" data-costo="550" data-tipo="mensual" style="padding: 4px; border-radius: 6px; border: 1px solid #ced4da; font-size: 12px; background: #f8f9fa; font-weight: 600;">
              <option value="0">No la tengo</option>
              <option value="1">Sí, la pago mensual</option>
            </select>
          </div>
        </div>

        <!-- Hábito 4 -->
        <div style="display: flex; flex-direction: column; gap: 4px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e1e6eb;">
          <label style="font-size: 12.5px; font-weight: 600; color: #222;">🍬 Refrescos, picaderas o golosinas</label>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <span style="font-size: 11px; color: #666;">Costo apróx: RD$ 100</span>
            <select class="input-habito-meta" data-costo="100" data-tipo="semanal" style="padding: 4px; border-radius: 6px; border: 1px solid #ced4da; font-size: 12px; background: #f8f9fa; font-weight: 600;">
              <option value="0">Nunca</option>
              <option value="1">1 vez x semana</option>
              <option value="3">3 veces x semana</option>
              <option value="5">5 veces x semana</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pizarra de Rescate Financiero -->
      <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #F3E1B6; text-align: center;">
        <div style="font-size: 12.5px; font-weight: 600; color: #555;">Dinero rescatado para tu meta:</div>
        <div id="totalRescateMetaMensual" style="font-size: 18px; font-weight: 800; color: #1F7A5C; margin: 2px 0;">RD$ 0 / mes</div>
        <div id="progresoFugaMetaAnual" style="font-size: 11px; color: #666; font-weight: 500;">¡Equivale a RD$ 0 acumulados al año!</div>
      </div>
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
          Con el costo de productos esenciales en constante movimiento, es completamente normal sentir que el dinero rinde menos. ¡La calle tiene sus desafíos y no estás solo en esto!
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

  // Reactividad inmediata en elementos móviles al inyectar el contenido
  document.querySelectorAll(".input-habito-meta").forEach(select => {
    select.addEventListener("change", calcularRescateEnMetas);
  });

  entrepreneurshipModule.style.display = "block";
  renderizarIdeasDeEmprendimiento(cuotaMensual);
}

function calcularRescateEnMetas() {
  let totalMensual = 0;

  document.querySelectorAll(".input-habito-meta").forEach(select => {
    const valor = parseFloat(select.value) || 0;
    const costo = parseFloat(select.getAttribute("data-costo")) || 0;
    const tipo = select.getAttribute("data-tipo");

    if (tipo === "semanal") {
      totalMensual += (valor * costo * 4.3333);
    } else if (tipo === "mensual") {
      totalMensual += (valor * costo);
    }
  });

  const totalAnual = totalMensual * 12;
  const txtMensual = document.getElementById("totalRescateMetaMensual");
  const txtAnual = document.getElementById("progresoFugaMetaAnual");

  if (txtMensual) {
    txtMensual.textContent = `RD$ ${Math.round(totalMensual).toLocaleString('es-DO')} / mes`;
  }
  if (txtAnual) {
    txtAnual.textContent = `¡Equivale a RD$ ${Math.round(totalAnual).toLocaleString('es-DO')} acumulados al año para tus metas!`;
  }
}

// =========================================================================
// --- 11. GENERACIÓN DINÁMICA DE SUGERENCIAS DE EMPRENDIMIENTO ---
// =========================================================================
function renderizarIdeasDeEmprendimiento(cuotaNecesaria) {
  const contenedorIdeas = document.getElementById("entrepreneurshipIdeasContainer");
  if (!contenedorIdeas) return;

  // Lista de ideas comunes contextualizadas al mercado dominicano
  const ideas = [
    { titulo: "Venta de ropa o accesorios virtuales", gananciaAprox: 8000 },
    { titulo: "Servicios independientes / Freelance (Diseño, Redacción, Soporte)", gananciaAprox: 12000 },
    { titulo: "Preparación de postres o picaderas por encargo", gananciaAprox: 6000 },
    { titulo: "Tutorías escolares o mentorías especializadas", gananciaAprox: 5000 }
  ];

  let htmlContenido = `<div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">`;

  ideas.forEach(idea => {
    const porcentajeCubierto = Math.min(Math.round((idea.gananciaAprox / cuotaNecesaria) * 100), 100);
    
    htmlContenido += `
      <div style="background: #fff; border: 1px solid #e1e6eb; padding: 12px; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
        <div style="font-weight: 600; color: #222; font-size: 13.5px; margin-bottom: 4px;">${idea.titulo}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11.5px; color: #666; margin-bottom: 6px;">
          <span>Ganancia estimada: <strong>RD$ ${idea.gananciaAprox.toLocaleString('es-DO')} /mes</strong></span>
          <span style="color: #1F7A5C; font-weight: 600;">Cubre el ${porcentajeCubierto}% de tu cuota</span>
        </div>
        <div style="background: #f0f2f5; height: 6px; border-radius: 4px; overflow: hidden;">
          <div style="background: #1F7A5C; width: ${porcentajeCubierto}%; height: 100%; border-radius: 4px;"></div>
        </div>
      </div>
    `;
  });

  htmlContenido += `</div>`;
  contenedorIdeas.innerHTML = htmlContenido;
}
