# Panel de Supervisión Operativa de Construcción de Redes M&D 🌐

Portal web corporativo y centralizado para el acceso rápido y seguro a los formularios operativos, reportes de supervisión en campo, tableros de Power BI y matrices de programación.

---

## 📋 Módulos y Formularios Incluidos

1. **Control De Vehículos**: Inspección preoperacional diaria de camionetas y móviles, kilometraje, neumáticos y kit vial.
2. **Control de Licencias**: Seguimiento a vigencias de licencias de conducir (MTC), exámenes médicos y certificaciones de trabajo en alturas.
3. **Registro Único de Observaciones**: Reporte inmediato de no conformidades, desvíos constructivos, actos y condiciones inseguras en campo.
4. **Registro Único de Cierre de Observaciones**: Evidencia fotográfica de subsanación y validación del levantamiento de observaciones por parte del supervisor.
5. **Power BI de Garantías**: Dashboard interactivo con indicadores de fallas en redes, tiempos de atención (SLA) y análisis de reclamos.
6. **Registro de Visitas a Cuadrillas Críticas**: Bitácora de acompañamiento focalizado a cuadrillas de alto riesgo o bajo rendimiento.
7. **Organigrama Semanal de Supervisores**: Programación semanal de turnos, zonas geográficas y contactos de supervisión de obra.

---

## 🚀 ¿Cómo Publicar Esta Página en tu Repositorio de GitHub?

Ya tienes tu repositorio creado en GitHub:
👉 **[Panel-de-supervisi-n-operativa-Construccion-de-Redes-M6](https://github.com/rchacon-cloud/Panel-de-supervisi-n-operativa-Construccion-de-Redes-M6)**

Sigue estos 3 sencillos pasos para publicarlo en internet con **GitHub Pages**:

### Paso 1: Subir los Archivos a GitHub
1. Abre tu repositorio en el navegador: [https://github.com/rchacon-cloud/Panel-de-supervisi-n-operativa-Construccion-de-Redes-M6](https://github.com/rchacon-cloud/Panel-de-supervisi-n-operativa-Construccion-de-Redes-M6)
2. En la pantalla de bienvenida, haz clic en el enlace azul: **`uploading an existing file`**.
3. Arrastra y suelta el archivo **`index.html`** (y este **`README.md`**) dentro del recuadro.
4. En la parte inferior, escribe en el mensaje del commit: `"Subir panel operativo M&D"` y presiona el botón verde **`Commit changes`**.

### Paso 2: Activar GitHub Pages (Web Gratuita para el equipo)
1. En tu repositorio, haz clic en la pestaña **Settings** (Configuración) arriba a la derecha.
2. En el menú lateral izquierdo, haz clic en **Pages**.
3. En la sección **Build and deployment** > **Branch**:
   - Cambia `None` por **`main`**.
   - Carpeta: deja seleccionada `/(root)`.
   - Haz clic en **Save** (Guardar).

### Paso 3: ¡Listo! Obtén tu enlace web
En unos 60 segundos, GitHub generará tu enlace público (por ejemplo: `https://rchacon-cloud.github.io/Panel-de-supervisi-n-operativa-Construccion-de-Redes-M6/`), el cual podrás compartir por WhatsApp o correo a todos los supervisores.

---

## 🛠️ ¿Cómo Configurar los Enlaces de tus Formularios?

El panel cuenta con dos opciones para que pongas tus enlaces reales (Google Forms, Microsoft Forms, Power BI o SharePoint):

1. **Desde la misma página web (Sin tocar código):**
   - Haz clic en el botón superior **"Configurar Enlaces"** (o en **"Editar URL"** en cada tarjeta).
   - Pega los enlaces de tus formularios y haz clic en **"Guardar Enlaces"**.
   - Quedarán guardados en tu navegador automáticamente.

2. **Fijándolos directamente en el código (`index.html`):**
   - Abre `index.html` con cualquier editor de texto o en GitHub.
   - En la sección `<script>` busca la variable `defaultLinks`:
   ```javascript
   const defaultLinks = {
     vehiculos: "https://forms.office.com/tu-enlace-aqui",
     licencias: "https://forms.office.com/tu-enlace-aqui",
     observaciones: "https://forms.office.com/tu-enlace-aqui",
     cierre_observaciones: "https://forms.office.com/tu-enlace-aqui",
     powerbi_garantias: "https://app.powerbi.com/view?r=tu-enlace-aqui",
     cuadrillas_criticas: "https://forms.office.com/tu-enlace-aqui",
     organigrama_semanal: "https://tu-enlace-aqui"
   };
   ```
   - Reemplaza las direcciones con tus URLs reales y guarda el archivo.

---

## 📱 Compatibilidad y Características
- **100% Responsivo**: Diseñado específicamente para funcionar a la perfección en smartphones de supervisores en terreno y pantallas de oficina.
- **Búsqueda instantánea**: Barra de búsqueda interactiva y filtros por categoría.
- **Modo Oscuro / Claro**: Para facilitar la lectura en campo bajo el sol o en la noche.
- **Copia rápida**: Botón para copiar los enlaces o generar un mensaje formateado para enviar por WhatsApp al equipo.
