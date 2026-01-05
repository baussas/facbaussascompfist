
        const urlParams = new URLSearchParams(window.location.search);
        const ventaId = urlParams.get('venta');
        const contentDiv = document.getElementById('content');
        
        function formatearPrecio(valor) {
            return `COP $${Math.round(valor).toLocaleString('es-CO')}`;
        }
        
        function formatearFecha(fecha) {
            const date = new Date(fecha.replace(' ', 'T'));
            return date.toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        async function cargarFacturaReal(id, intentoActual = 1, maxIntentos = 6) {
            try {
                const jsonUrl = `../../facturas/${id}.json`;
                console.log(`Intento ${intentoActual}/${maxIntentos}: ${jsonUrl}`);
                
                const response = await fetch(jsonUrl, { cache: 'no-store' });
                
                if (!response.ok) {
                    if (intentoActual < maxIntentos) {
                        await new Promise(resolve => setTimeout(resolve, 10000));
                        return cargarFacturaReal(id, intentoActual + 1, maxIntentos);
                    }
                    throw new Error(`Factura no encontrada después de ${maxIntentos} intentos`);
                }
                
                const data = await response.json();
                console.log('✅ Factura cargada:', data);
                
                // ✅ INFORMACIÓN DEL CLIENTE CON CC/NIT
                let clienteHTML = '';
                if (data.cliente) {
                    const esContado = data.cliente.nombre === 'CONTADO';
                    
                    clienteHTML = `
                        <div class="info-section">
                            <h3>👤 Cliente</h3>
                            <div class="info-item">
                                <strong>Nombre:</strong>
                                <span>${data.cliente.nombre}</span>
                            </div>
                    `;
                    
                    if (!esContado) {
                        // ✅ MOSTRAR CC/NIT SI EXISTE
                        if (data.cliente.identificacion) {
                            clienteHTML += `
                                <div class="info-item">
                                    <strong>CC/NIT:</strong>
                                    <span>${data.cliente.identificacion}</span>
                                </div>
                            `;
                        }
                        
                        if (data.cliente.telefono) {
                            clienteHTML += `
                                <div class="info-item">
                                    <strong>Teléfono:</strong>
                                    <span>${data.cliente.telefono}</span>
                                </div>
                            `;
                        }
                        if (data.cliente.email) {
                            clienteHTML += `
                                <div class="info-item">
                                    <strong>Email:</strong>
                                    <span>${data.cliente.email}</span>
                                </div>
                            `;
                        }
                        if (data.cliente.direccion) {
                            clienteHTML += `
                                <div class="info-item">
                                    <strong>Dirección:</strong>
                                    <span>${data.cliente.direccion}</span>
                                </div>
                            `;
                        }
                    } else {
                        clienteHTML += `
                            <div class="cliente-badge">💵 VENTA AL CONTADO</div>
                        `;
                    }
                    
                    clienteHTML += `</div>`;
                }
                
                // ✅ INFORMACIÓN DEL MÉTODO DE PAGO
                let metodoPagoHTML = '';
                if (data.metodo_pago) {
                    const metodo = data.metodo_pago;
                    const tipo = metodo.tipo ? metodo.tipo.toLowerCase() : 'efectivo';
                    
                    let badgeClass = 'payment-efectivo';
                    let icono = '💵';
                    let tipoTexto = 'Efectivo';
                    
                    if (tipo === 'transferencia') {
                        badgeClass = 'payment-transferencia';
                        icono = '🏦';
                        tipoTexto = 'Transferencia';
                    } else if (tipo === 'mixto') {
                        badgeClass = 'payment-mixto';
                        icono = '💳';
                        tipoTexto = 'Mixto';
                    }
                    
                    metodoPagoHTML = `
                        <div class="info-section">
                            <h3>💳 Método de Pago</h3>
                            <div style="margin-bottom: 12px;">
                                <span class="payment-badge ${badgeClass}">${icono} ${tipoTexto}</span>
                            </div>
                    `;
                    
                    // EFECTIVO
                    if (tipo === 'efectivo') {
                        if (metodo.monto_recibido > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>Recibido:</strong>
                                    <span>${formatearPrecio(metodo.monto_recibido)}</span>
                                </div>
                            `;
                        }
                        if (metodo.cambio > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>Cambio:</strong>
                                    <span style="color: #4caf50; font-weight: 700;">${formatearPrecio(metodo.cambio)}</span>
                                </div>
                            `;
                        }
                    }
                    
                    // TRANSFERENCIA
                    else if (tipo === 'transferencia') {
                        if (metodo.monto_transferencia > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>Monto:</strong>
                                    <span>${formatearPrecio(metodo.monto_transferencia)}</span>
                                </div>
                            `;
                        }
                    }
                    
                    // MIXTO
                    else if (tipo === 'mixto') {
                        if (metodo.monto_efectivo > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>💵 Efectivo:</strong>
                                    <span>${formatearPrecio(metodo.monto_efectivo)}</span>
                                </div>
                            `;
                        }
                        if (metodo.monto_transferencia > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>🏦 Transferencia:</strong>
                                    <span>${formatearPrecio(metodo.monto_transferencia)}</span>
                                </div>
                            `;
                        }
                        if (metodo.monto_recibido > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>Efectivo Recibido:</strong>
                                    <span>${formatearPrecio(metodo.monto_recibido)}</span>
                                </div>
                            `;
                        }
                        if (metodo.cambio > 0) {
                            metodoPagoHTML += `
                                <div class="info-item">
                                    <strong>Cambio:</strong>
                                    <span style="color: #4caf50; font-weight: 700;">${formatearPrecio(metodo.cambio)}</span>
                                </div>
                            `;
                        }
                    }
                    
                    metodoPagoHTML += `</div>`;
                }
                
                // HTML completo de la factura
                const facturaHTML = `
                    <div class="invoice-info">
                        <h2 style="font-size: 22px; margin-bottom: 15px;">✅ Factura Localizada</h2>
                        <p style="opacity: 0.95;">Tu factura ha sido encontrada exitosamente.</p>
                        <div style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 10px; font-weight: 600; font-size: 18px;">
                            Factura #${data.id}
                        </div>
                    </div>
                    
                    <div class="pdf-container">
                        <div class="factura-header">
                            <h2>BAUS S.A.S</h2>
                            <p style="font-size: 12px; color: #666; margin: 3px 0;">NIT: 123456789-12</p>
                            <p style="font-size: 12px; color: #666; margin: 3px 0;">Cra 123 #12-34, Barranquilla/Atlántico</p>
                            <p style="font-size: 12px; color: #666; margin: 3px 0;">Tel: 300 9626009</p>
                        </div>
                        
                        <!-- Datos de la Factura -->
                        <div class="info-section">
                            <h3>📄 Datos de la Factura</h3>
                            <div class="info-item">
                                <strong>N° Factura:</strong>
                                <span>#${data.id}</span>
                            </div>
                            <div class="info-item">
                                <strong>Fecha:</strong>
                                <span>${formatearFecha(data.fecha)}</span>
                            </div>
                        </div>

                        <!-- Datos del Cliente -->
                        ${clienteHTML}
                        
                        <!-- Método de Pago -->
                        ${metodoPagoHTML}

                        <!-- Ítems -->
                        <div class="factura-items">
                            <div class="items-header">
                                <div>Cant.</div>
                                <div>Descripción</div>
                                <div style="text-align: right;">Subtotal</div>
                            </div>
                            ${data.items.map(item => `
                                <div class="item-row">
                                    <div>${item.cantidad}</div>
                                    <div>${item.nombre}</div>
                                    <div style="text-align: right;">${formatearPrecio(item.subtotal)}</div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <!-- Total -->
                        <div class="factura-total">
                            <div class="total-row">
                                <span>TOTAL:</span>
                                <span>${formatearPrecio(data.total)}</span>
                            </div>
                        </div>
                        
                        <!-- Código QR y URL -->
                        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #f0f0f0;">
                            <img src="./facturas/${id}_qr.png" alt="Código QR" style="max-width: 150px; border-radius: 8px;" onerror="this.style.display='none'">
                            <p style="font-size: 11px; color: #999; margin-top: 10px;">${window.location.href}</p>
                        </div>
                    </div>
                    
                    <div class="actions">
                        <a href="../../facturas/${id}.pdf" download="Factura_${id}.pdf" class="btn btn-primary">
                            📥 Descargar PDF
                        </a>
                        <button onclick="window.print()" class="btn btn-primary">
                            🖨️ Imprimir
                        </button>
                    </div>
                `;
                
                contentDiv.innerHTML = facturaHTML;
                
            } catch (error) {
                console.error('❌ Error:', error);
                contentDiv.innerHTML = `
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(245, 87, 108, 0.3);">
                        <h3 style="font-size: 24px; margin-bottom: 15px;">❌ No se pudo cargar la factura</h3>
                        <p style="opacity: 0.95; line-height: 1.8;">No se encontró la factura #${id}</p>
                        <div style="margin-top: 30px; text-align: center;">
                            <button onclick="location.reload()" class="btn btn-primary" style="display: inline-flex;">
                                🔄 Reintentar
                            </button>
                        </div>
                    </div>
                `;
            }
        }
        
        if (ventaId) {
            cargarFacturaReal(ventaId);
        } else {
            contentDiv.innerHTML = `
                <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 15px;">
                    <h2 style="color: #1a1a1a; font-size: 24px; margin-bottom: 20px;">📋 Instrucciones</h2>
                    <p style="color: #333; line-height: 1.8;">Para consultar tu factura, escanea el código QR en tu ticket de compra.</p>
                </div>
            `;
        }
