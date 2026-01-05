async function buscarFactura() {
  const cedula = document.getElementById("cedula").value.trim();
  const facturaId = document.getElementById("facturaId").value.trim();
  const resultado = document.getElementById("resultado");

  resultado.textContent = "";
  resultado.style.color = "red";

  // 1️⃣ Validación inicial
  if (!cedula && !facturaId) {
    resultado.textContent = "⚠️ Ingresa el CC/NIT y el ID de la factura";
    return;
  }

  // 2️⃣ Si hay ID pero NO hay cédula → bloquear
  if (facturaId && !cedula) {
    resultado.textContent = "⚠️ Debes ingresar también ID del cliente";
    return;
  }

  // 📌 Lista de facturas disponibles (manual por ahora)
  const posiblesFacturas = [187, 186, 185, 184];

  // 3️⃣ CASO: ID + CÉDULA
  if (facturaId && cedula) {
    try {
      const res = await fetch(`../../facturas/${facturaId}.json`, {
        cache: "no-store"
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      // 🔐 Validar cédula
      if (
        data.cliente &&
        data.cliente.identificacion === cedula
      ) {
        window.location.href = `../principal/index.html?venta=${facturaId}`;
        return;
      } else {
        resultado.textContent = "❌ La factura no pertenece a esa ID";
        return;
      }

    } catch {
      resultado.textContent = "❌ Factura no encontrada";
      return;
    }
  }

  // 4️⃣ CASO: SOLO CÉDULA → buscar última factura
  if (cedula && !facturaId) {
    let ultimaFactura = null;

    for (let id of posiblesFacturas) {
      try {
        const res = await fetch(`../../facturas/${id}.json`, {
          cache: "no-store"
        });

        if (!res.ok) continue;

        const data = await res.json();

        if (
          data.cliente &&
          data.cliente.identificacion === cedula
        ) {
          // guardamos la más reciente
          ultimaFactura = id;
        }

      } catch {
        continue;
      }
    }

    if (ultimaFactura) {
      window.location.href = `../principal/index.html?venta=${ultimaFactura}`;
      return;
    } else {
      resultado.textContent = "❌ No existen facturas para esa cédula";
      return;
    }
  }
}
