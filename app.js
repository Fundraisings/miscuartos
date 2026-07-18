/**
 * MISCUARTOS APP - SCRIPT PRINCIPAL COMPLETO (2026)
 * Contiene: Pantalla de inicio, navegación, presupuesto con inputs optimizados,
 * gráficos dinámicos por categorías, alertas de educación financiera, botón de WhatsApp,
 * reto con Árbol Navideño 3D Giratorio interactivo, simulador AFP y Coach.
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

      navButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

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

  // 7 Items con sus iconos y placeholders correspondientes
  const categorias = [
    { id: "vivienda", label: "🏠 Vivienda y Alquiler", placeholder: "Ej. 15,000", icon: "🏠" },
    { id: "alimentos", label: "🛒 Súper y Comida (Canasta básica)", placeholder: "Ej. 12,000", icon: "🛒" },
    { id: "transporte", label: "🚗 Gasolina, Concho o Mototaxi", placeholder: "Ej. 4,000", icon: "🚗" },
    { id: "servicios", label: "⚡ Luz, Agua, Internet y celular", placeholder: "Ej. 3,500", icon: "⚡" },
    { id: "entretenimiento", label: "🍗 Salidas, Coros y Delivery", placeholder: "Ej. 3,000", icon: "🍗" },
    { id: "mascotas", label: "🐶 Mascotas (Alimento y Vet)", placeholder: "Ej. 2,500", icon: "🐶" },
    { id: "deudas", label: "💳 Tarjetas y Préstamos", placeholder: "Ej. 5,000", icon: "💳" }
  ];

  resultsContainer.innerHTML = "";
  
  categorias.forEach(cat => {
    const card = document.createElement("div");
    card.style = "background: #fff; padding: 16px; border-radius: 14px; margin-bottom: 14px; border: 1px solid #e1e6eb; display: flex; flex-direction: column; gap: 8px; transition: all 0.3s ease;";
    card.id = `card-${cat.id}`;
    
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
        <!-- Bloque Izquierdo: Textos e Input abajo -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
          <label for="${cat.id}" style="font-size: 14px; font-weight: 600; color: #111;">${cat.label}</label>
          <div style="display: flex; align-items: center; gap: 6px; background: #f8f9fa; border: 1px solid #ced4da; border-radius: 8px; padding: 6px 10px; max-width: 180px;">
            <span style="font-weight: 700; color: #495057; font-size: 13px;">RD$</span>
            <input type="number" id="${cat.id}" placeholder="${cat.placeholder}" inputmode="numeric" class="gastos-input" data-id="${cat.id}" data-label="${cat.label}" style="width: 100%; border: none; background: transparent; font-size: 14px; text-align: right; outline: none; font-weight: 600;">
          </div>
        </div>
        
        <!-- Bloque Derecho: Recuadro con Gráfico/Icono Visual Dinámico -->
        <div id="visual-${cat.id}" style="width: 52px; height: 52px; border-radius: 12px; background: #e9ecef; border: 1px solid #ced4da; display: flex; align-items: center; justify-content: center; font-size: 24px; transition: all 0.3s ease; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.05);">
          ${cat.icon}
        </div>
      </div>
      
      <!-- Contenedor dinámico para Educación Financiera y Alertas según el % -->
      <div id="edu-${cat.id}" style="font-size: 12px; color: #666; font-weight: 500; transition: all 0.3s ease; margin-top: 2px;">
        Introduce un monto para evaluar el impacto en tus ingresos.
      </div>
    `;
    resultsContainer.appendChild(card);
  });

  // Botón de WhatsApp
  const whatsappBtnContainer = document.createElement("div");
  whatsappBtnContainer.style = "margin-top: 24px; text-align: center;";
  whatsappBtnContainer.innerHTML = `
    <button id="shareWhatsappBtn" style="background-color: #25D366; color: white; border: none; padding: 14px 28px; font-size: 15px; font-weight: bold; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(37,211,102,0.25); transition: transform 0.2s, background 0.2s;">
      🟢 Enviar por WhatsApp
    </button>
  `;
  resultsContainer.appendChild(whatsappBtnContainer);

  // Escuchar cambios
  document.querySelectorAll(".gastos-input").forEach(input => {
    input.addEventListener("input", () => {
      calcularPresupuestoInstantaneo();
      actualizarAnalisisDelCoach();
    });
  });

  const shareBtn = document.getElementById("shareWhatsappBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", enviarPresupuestoWhatsApp);
  }
}

function calcularPresupuestoInstantaneo() {
  const sueldo = parseFloat(document.getElementById("income").value) || 0;
  let totalGastos = 0;
  let camposConMonto = 0;

  // Primero calculamos el total
  document.querySelectorAll(".gastos-input").forEach(input => {
    const valor = parseFloat(input.value) || 0;
    if (valor > 0) {
      totalGastos += valor;
      camposConMonto++;
    }
  });

  // Actualizamos cada tarjeta dinámicamente con alertas y colores
  document.querySelectorAll(".gastos-input").forEach(input => {
    const id = input.getAttribute("data-id");
    const valor = parseFloat(input.value) || 0;
    const boxVisual = document.getElementById(`visual-${id}`);
    const eduTexto = document.getElementById(`edu-${id}`);
    
    if (!boxVisual || !eduTexto) return;

    if (valor <= 0) {
      // ESTADO APAGADO (GRIS)
      boxVisual.style.background = "#e9ecef";
      boxVisual.style.borderColor = "#ced4da";
      boxVisual.style.boxShadow = "inset 0 -2px 4px rgba(0,0,0,0.05)";
      eduTexto.innerHTML = "Introduce un monto para evaluar el impacto en tus ingresos.";
      eduTexto.style.color = "#666";
    } else {
      // Calcular porcentaje en base al sueldo disponible
      const porcentaje = sueldo > 0 ? (valor / sueldo) * 100 : 0;

      if (porcentaje > 35) {
        // ESTADO ALERTA CRÍTICA (ROJO)
        boxVisual.style.background = "#FFEBE9";
        boxVisual.style.borderColor = "#FF8170";
        boxVisual.style.boxShadow = "0 0 8px rgba(255,129,112,0.4)";
        eduTexto.innerHTML = `⚠️ <strong>¡Alerta!</strong> Este gasto representa el <strong>${porcentaje.toFixed(1)}%</strong> de tus ingresos. Supera el límite recomendado del 35%. Podría comprometer tu salud financiera total mensual.`;
        eduTexto.style.color = "#D9381E";
      } else {
        // ESTADO CONTROLADO (VERDE)
        boxVisual.style.background = "#E6F4EA";
        boxVisual.style.borderColor = "#57B988";
        boxVisual.style.boxShadow = "0 0 8px rgba(87,185,136,0.4)";
        eduTexto.innerHTML = `✅ Gasto controlado: Representa el <strong>${porcentaje.toFixed(1)}%</strong> de tus ingresos totales. ¡Buen manejo dentro del presupuesto recomendado!`;
        eduTexto.style.color = "#137333";
      }
    }
  });

  const countTag = document.getElementById("countTag");
  if (countTag) {
    countTag.textContent = `${camposConMonto} con monto`;
  }

  return totalGastos;
}

function enviarPresupuestoWhatsApp() {
  const sueldo = parseFloat(document.getElementById("income").value) || 0;
  let mensaje = `📊 *MI PRESUPUESTO - MISCUARTOS APP*\n`;
  mensaje += `💰 *Ingresos mensuales:* RD$ ${sueldo.toLocaleString('es-DO')}\n\n`;
  mensaje += `📝 *Detalle de Gastos registrados:*\n`;

  let totalGastos = 0;
  let hayGastos = false;

  document.querySelectorAll(".gastos-input").forEach(input => {
    const valor = parseFloat(input.value) || 0;
    if (valor > 0) {
      const label = input.getAttribute("data-label");
      mensaje += `${label}: RD$ ${valor.toLocaleString('es-DO')}\n`;
      totalGastos += valor;
      hayGastos = true;
    }
  });

  if (!hayGastos) {
    alert("Por favor, ingresa al menos un monto en tus gastos antes de enviar.");
    return;
  }

  const balance = sueldo - totalGastos;
  mensaje += `\n📉 *Total Gastos:* RD$ ${totalGastos.toLocaleString('es-DO')}\n`;
  mensaje += `💵 *Balance Libre:* RD$ ${balance.toLocaleString('es-DO')}\n\n`;
  mensaje += `_Generado desde mi App de Control Financiero 2026._`;

  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// --- 6. LÓGICA DE LA PESTAÑA: RETO NAVIDEÑO CON ÁRBOL 3D GIRATORIO ---
function inicializarRetoNavideno() {
  const xmasWeeksContainer = document.getElementById("xmasWeeks");
  const progresoNum = document.getElementById("xmasProgressNum");
  if (!xmasWeeksContainer) return;

  // Inyección de estilos CSS para la perspectiva y rotación 3D nativa
  if (!document.getElementById("xmas3dStyles")) {
    const styleTag = document.createElement("style");
    styleTag.id = "xmas3dStyles";
    styleTag.innerHTML = `
      @keyframes spin3d {
        0% { transform: rotateY(0deg); }
        100% { transform: rotateY(360deg); }
      }
      .tree-3d-scene {
        perspective: 600px;
        width: 140px;
        height: 200px;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .tree-3d-body {
        width: 100%;
        height: 100%;
        position: relative;
        transform-style: preserve-3d;
        animation: spin3d 8s linear infinite;
      }
      .tree-layer {
        position: absolute;
        left: 50%;
        transform-origin: 0% 50%;
      }
      .layer-1 { top: 20px; border-left: 35px solid transparent; border-right: 35px solid transparent; border-bottom: 50px solid #1B4D3E; margin-left: -35px; }
      .layer-2 { top: 45px; border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 65px solid #143D31; margin-left: -50px; }
      .layer-3 { top: 75px; border-left: 65px solid transparent; border-right: 65px solid transparent; border-bottom: 80px solid #0F2E25; margin-left: -65px; }
    `;
    document.head.appendChild(styleTag);
  }

  xmasWeeksContainer.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin: 20px 0; position: relative; min-height: 440px; width: 100%;">
      
      <div style="display: flex; width: 100%; max-width: 340px; align-items: center; justify-content: space-between; position: relative;">
        
        <!-- Escena y Objeto del Árbol 3D en Rotación Continua -->
        <div style="display: flex; flex-direction: column; align-items: center; width: 140px; position: relative; margin-left: 10px;">
          
          <!-- Estrella Superior Fija en el eje z exterior -->
          <div id="starXmas" style="position: absolute; top: -15px; z-index: 10; font-size: 26px; color: #A0AAB2; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)); transition: all 0.4s ease; user-select: none;">⭐</div>
          
          <div class="tree-3d-scene">
            <div class="tree-3d-body">
              <!-- Cara A (Frontal) -->
              <div class="tree-layer layer-1" style="transform: rotateY(0deg);"></div>
              <div class="tree-layer layer-2" style="transform: rotateY(0deg);"></div>
              <div class="tree-layer layer-3" style="transform: rotateY(0deg);"></div>
              
              <!-- Cara B (Cruzada 90 grados para efecto volumétrico 3D) -->
              <div class="tree-layer layer-1" style="transform: rotateY(90deg);"></div>
              <div class="tree-layer layer-2" style="transform: rotateY(90deg);"></div>
              <div class="tree-layer layer-3" style="transform: rotateY(90deg);"></div>
            </div>
          </div>
          
          <!-- Tronco del árbol -->
          <div style="width: 24px; height: 32px; background: #5C4033; border-radius: 0 0 4px 4px; margin-top: -15px; z-index: 2;"></div>
        </div>

        <!-- Panel de Luces / Esferas Numéricas (Lado Derecho) -->
        <div id="lucesXmasContainer" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; width: 170px; background: rgba(244, 247, 249, 0.7); padding: 10px; border-radius: 14px; border: 1px dashed #ced4da; z-index: 5;">
        </div>

      </div>

      <!-- Mensaje Dinámico de Logro Navideño -->
      <div id="mensajeExitoNavidad" style="width: 100%; max-width: 320px; text-align: center; display: none; transition: all 0.3s ease;">
        <div style="background: #E6F4EA; border: 2px solid #3E9C77; color: #0F3D2A; padding: 15px; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 12px rgba(62,156,119,0.2);">
          🎉 ¡Felicidades, meta cumplida! 🎄<br>
          <span style="font-weight: 500; font-size: 13.5px; display: block; margin-top: 6px; color: #1B5E20;">
            Completaste tus 22 semanas de ahorro. ¡Tu doble sueldo o meta navideña está asegurada sin deudas! 🇩🇴✨
          </span>
        </div>
      </div>

    </div>
  `;

  const lucesContainer = document.getElementById("lucesXmasContainer");
  if (!lucesContainer) return;

  const esferasCompletadas = new Set();

  for (let i = 1; i <= 22; i++) {
    const esfera = document.createElement("div");
    esfera.style = "width: 34px; height: 34px; border-radius: 50%; background: #E9ECEF; border: 2px solid #CED4DA; font-weight: bold; font-size: 12px; text-align: center; line-height: 30px; cursor: pointer; user-select: none; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); color: #495057; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);";
    esfera.textContent = i;

    esfera.addEventListener("click", () => {
      if (esferasCompletadas.has(i)) {
        esferasCompletadas.delete(i);
        esfera.style.background = "#E9ECEF";
        esfera.style.borderColor = "#CED4DA";
        esfera.style.color = "#495057";
        esfera.style.boxShadow = "inset 0 -2px 4px rgba(0,0,0,0.1)";
        esfera.style.transform = "scale(1)";
      } else {
        esferasCompletadas.add(i);
        
        let colorBrillo = "#FF4136";
        if (i % 3 === 0) colorBrillo = "#FFDC00";
        else if (i % 2 === 0) colorBrillo = "#2ECC40";
        
        esfera.style.background = colorBrillo;
        esfera.style.borderColor = "#FFF";
        esfera.style.color = colorBrillo === "#FFDC00" ? "#111" : "#FFF";
        esfera.style.boxShadow = `0 0 8px ${colorBrillo}, inset 0 -2px 4px rgba(0,0,0,0.2)`;
        esfera.style.transform = "scale(1.12)";
      }

      const exitoBox = document.getElementById("mensajeExitoNavidad");
      const estrella = document.getElementById("starXmas");
      
      if (esferasCompletadas.size === 22) {
        if (estrella) {
          estrella.style.color = "#FFD700";
          estrella.style.filter = "drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 25px #FFDC00)";
          estrella.style.transform = "scale(1.4)";
        }
        if (exitoBox) exitoBox.style.display = "block";
        if (progresoNum) progresoNum.style.display = "none";
      } else {
        if (estrella) {
          estrella.style.color = "#A0AAB2";
          estrella.style.filter = "drop-shadow(0 1px 2px rgba(0,0,0,0.2))";
          estrella.style.transform = "scale(1)";
        }
        if (exitoBox) exitoBox.style.display = "none";
        if (progresoNum) {
          progresoNum.style.display = "block";
          progresoNum.textContent = `Llevas ${esferasCompletadas.size} de 22 semanas iluminadas.`;
        }
      }
    });

    lucesContainer.appendChild(esfera);
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

// --- 8. LÓGICA DE LA PESTAÑA: METAS Y ENFOQUE CON DESPLEGABLES ---
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
