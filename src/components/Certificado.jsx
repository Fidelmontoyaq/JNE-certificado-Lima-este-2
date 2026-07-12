import { useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';

const Certificado = ({ persona, alCerrar }) => {
  const canvasRef = useRef(null);

  // EFECTO DE DIBUJO (Se ejecuta instantáneamente cuando la persona cambia)
  useEffect(() => {
    let activo = true;

    const dibujar = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Fondo sólido
      ctx.fillStyle = "#ffffff"; 
      ctx.fillRect(0, 0, width, height);

      // Carga de imágenes
      const cargarImg = (src) => new Promise(res => {
        const img = new Image();
        img.src = src;
        img.crossOrigin = "anonymous";
        img.onload = () => res(img);
        img.onerror = () => res(null);
      });

      const [logo, logoElecciones, fondo, firma] = await Promise.all([
        cargarImg('/img/logo.png'),
        cargarImg('/img/elecciones-generales-2026.svg'),
        cargarImg('/img/fondo.png'),
        cargarImg('/img/firma.png')
      ]);

      if (!activo || !canvasRef.current) return;

      // Marca de agua de fondo
      if (fondo) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        const scale = 0.5;
        const newWidth = fondo.width * scale;
        const newHeight = fondo.height * scale;
        const x = (width - newWidth) / 2;
        const y = (height - newHeight) / 2;
        ctx.drawImage(fondo, x, y, newWidth, newHeight);
        ctx.restore();
      }

      // Encabezado Rojo
      ctx.fillStyle = "#b01e23";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(width, 0);
      ctx.lineTo(width, 220); 
      ctx.quadraticCurveTo(width / 2, 110, 0, 220);
      ctx.closePath();
      ctx.fill();

      // Franja inferior
      ctx.fillStyle = "#b01e23";
      ctx.fillRect(0, height - 12, width, 12);

      // Logos superiores
      ctx.save();
      ctx.filter = 'brightness(0) invert(1)';
      if (logo) {
        const escalaLogo = 95 / logo.height;
        ctx.drawImage(logo, 60, 30, (logo.width * escalaLogo) * 1.2, 95 * 1.2);
      }
      if (logoElecciones) {
        const escalaElec = 55 / logoElecciones.height;
        const anchoElec = logoElecciones.width * escalaElec;
        ctx.drawImage(logoElecciones, width - anchoElec - 60, 50, anchoElec, 55);
      }
      ctx.restore();

      // Textos principales del encabezado (Usando fuentes estándar del sistema)
      ctx.fillStyle = "#b01e23";
      ctx.textAlign = "center";
      ctx.font = "bold 32px Arial, Helvetica, sans-serif";
      ctx.fillText("CONSTANCIA DE PRESTACIÓN DE SERVICIOS", width / 2, 270);

      ctx.fillStyle = "#000000";
      ctx.font = "19px Arial, Helvetica, sans-serif";
      ctx.fillText("El Presidente del Jurado Electoral Especial de Lima Este 2, otorga la Constancia a:", width / 2, 320);

      // Nombre del fiscalizador
      ctx.fillStyle = "#000000";
      ctx.font = "bold 40px Arial, Helvetica, sans-serif";
      ctx.fillText(persona?.nombre || "Nombres y Apellidos", width / 2, 385);

      // --- LÓGICA DINÁMICA DE FECHAS SEGÚN EL CONTRATO ---
      const tipoContrato = persona?.cargo || persona?.contrato || '';
      let rangoFechasContrato = "01 al 08 de Julio"; // Por defecto FLV URBANO

      if (tipoContrato.includes("CONTINGENCIA")) {
        rangoFechasContrato = "05 al 08 de Julio";
      }

      // --- CUERPO JUSTIFICADO ---
      const inicioX = 120;
      const finX = width - 120;
      const anchoDisponible = finX - inicioX;
      let renglonY = 432; 
      const altoLinea = 23; 

      const lineasTexto = [
        {
          justificar: true,
          segmentos: [{ text: "Por su participación e identificación con el Jurado Nacional de Elecciones, por haber Prestado ", bold: false }]
        },
        {
          justificar: true,
          segmentos: [
            { text: "servicios de ", bold: false },
            { text: `${persona?.cargo || 'FISCALIZADOR DE LOCAL DE VOTACIÓN'} `, bold: true },
            { text: "del ", bold: false },
            { text: `${rangoFechasContrato}`, bold: true },
            { text: ", asignado ", bold: false }
          ]
        },
        {
          justificar: true,
          segmentos: [{ text: "al Jurado Electoral Especial de Lima Este 2, garantizando el respeto de la voluntad ciudadana, manifestada en ", bold: false }]
        },
        {
          justificar: true,
          segmentos: [
            { text: "el ", bold: false },
            { text: "Proceso de las Elecciones Generales 2026 – Segunda vuelta", bold: true },
            { text: ", llevadas a cabo el 7 de Junio del ", bold: false }
          ]
        },
        {
          justificar: false,
          segmentos: [{ text: "2026.", bold: false }]
        }
      ];

      ctx.textAlign = "left";

      lineasTexto.forEach((linea) => {
        let xCursor = inicioX;

        if (linea.justificar) {
          let palabras = [];
          linea.segmentos.forEach(seg => {
            const listaPalabras = seg.text.split(' ');
            listaPalabras.forEach((pal, index) => {
              const textoPalabra = pal + (index < listaPalabras.length - 1 ? ' ' : '');
              if (textoPalabra !== '') {
                palabras.push({ text: textoPalabra, bold: seg.bold });
              }
            });
          });

          if (palabras.length > 1) {
            let anchoNatural = 0;
            palabras.forEach(p => {
              ctx.font = p.bold ? "bold 18px Arial, Helvetica, sans-serif" : "18px Arial, Helvetica, sans-serif";
              anchoNatural += ctx.measureText(p.text.trimEnd()).width; 
            });

            const espacioSobrante = anchoDisponible - anchoNatural;
            const numeroDeHuecos = palabras.length - 1;
            const espacioExtraPorHueco = espacioSobrante / numeroDeHuecos;

            // Evitamos saltos drásticos si la última palabra tiene demasiada separación
            const espacioLimite = 25; 
            const usarEspaciadoNormal = (espacioExtraPorHueco > espacioLimite);

            palabras.forEach((p) => {
              ctx.font = p.bold ? "bold 18px Arial, Helvetica, sans-serif" : "18px Arial, Helvetica, sans-serif";
              const palTexto = p.text.trimEnd();
              ctx.fillText(palTexto, xCursor, renglonY);
              
              if (usarEspaciadoNormal) {
                xCursor += ctx.measureText(p.text).width;
              } else {
                xCursor += ctx.measureText(palTexto).width + espacioExtraPorHueco;
              }
            });
          } else {
            ctx.font = linea.segmentos[0].bold ? "bold 18px Arial, Helvetica, sans-serif" : "18px Arial, Helvetica, sans-serif";
            ctx.fillText(linea.segmentos[0].text, inicioX, renglonY);
          }
        } else {
          linea.segmentos.forEach(seg => {
            ctx.font = seg.bold ? "bold 18px Arial, Helvetica, sans-serif" : "18px Arial, Helvetica, sans-serif";
            ctx.fillText(seg.text, xCursor, renglonY);
            xCursor += ctx.measureText(seg.text).width;
          });
        }
        renglonY += altoLinea;
      });

      // Nota final de conveniencia
      renglonY += 15; 
      ctx.font = "19px Arial, Helvetica, sans-serif";
      ctx.fillText("Se expide el presente documento para los fines que el interesado considere convenientes.", inicioX, renglonY);

      // Ubicación y Fecha de Expedición Actualizada
      // CAMBIO: Emitido el 13 de Julio del 2026
      renglonY += 30;
      ctx.font = "bold 18px Arial, Helvetica, sans-serif";
      ctx.fillText("Lima, 13 de Julio de 2026", inicioX, renglonY);

      // --- ÁREA DE FIRMAS ---
      const centroFirmaX = width / 2;
      const firmaY = 670; 

      if (firma) {
        const escalaFirma = 100 / firma.height; 
        const anchoFirma = firma.width * escalaFirma;
        ctx.drawImage(firma, centroFirmaX - (anchoFirma / 2), firmaY - 70, anchoFirma, 100);
      }
      
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centroFirmaX - 150, firmaY);
      ctx.lineTo(centroFirmaX + 150, firmaY);
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.font = "16px Arial, Helvetica, sans-serif";
      ctx.fillText("Rosa Maria Rebaza Carrazco", centroFirmaX, firmaY + 25);
      ctx.font = "bold 15px Arial, Helvetica, sans-serif";
      ctx.fillText("Presidente del Jurado Especial Electoral", centroFirmaX, firmaY + 45);
      ctx.font = "14px Arial, Helvetica, sans-serif";
      ctx.fillText("Lima Este 2", centroFirmaX, firmaY + 65);
    };

    dibujar();
    return () => { activo = false; };
  }, [persona]); // Solo se ejecuta si cambian los datos de la persona

  const descargar = () => {
    if (!canvasRef.current) return;
    const imgData = canvasRef.current.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF('l', 'mm', 'a4');
    pdf.addImage(imgData, 'JPEG', 0, 0, 297, 210);
    pdf.save(`Constancia_JNE_${persona?.dni || 'Documento'}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center p-4 z-50">
      <div className="relative bg-white p-2 rounded-sm shadow-2xl max-w-full">
        <canvas 
          ref={canvasRef} 
          width="1122" 
          height="794" 
          className="max-w-full h-auto bg-white" 
        />
      </div>
      <div className="mt-6 flex gap-4">
        <button 
          onClick={descargar} 
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-all"
        >
          Descargar PDF
        </button>
        <button onClick={alCerrar} className="bg-gray-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 shadow-lg transition-all">
          Volver
        </button>
      </div>
    </div>
  );
};

export default Certificado;
