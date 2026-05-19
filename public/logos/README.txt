LOGOS DE ORGANIZACION
=====================

Pone aca los logos de tu organizacion para usarlos en los formularios.

Como agregar un logo:
1. Copia tu archivo a esta carpeta (ej: mi-org.png, mi-org.svg)
2. En tu flow, usa el componente FlowHeader con la prop logo:

   <FlowHeader
     title="Sumate"
     description="Tu donacion ayuda..."
     logo="/logos/mi-org.png"
   />

Formatos recomendados:
- SVG (mejor calidad, escala sin pixelarse)
- PNG con fondo transparente
- Altura sugerida: 40-80px

Tambien podes usar URLs externas:
   logo="https://cdn.miorg.com/logo.svg"
