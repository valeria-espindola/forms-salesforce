<script setup lang="ts">
/**
 * FlowHeader — Header reutilizable para flows con soporte de logo.
 *
 * Uso básico (sin logo):
 *   <FlowHeader title="Sumate" description="Tu donación ayuda..." />
 *
 * Con logo (archivo en public/logos/):
 *   <FlowHeader
 *     title="Sumate a TECHO"
 *     description="Tu donación nos ayuda..."
 *     logo="/logos/techo.png"
 *   />
 *
 * Con logo externo (URL completa):
 *   <FlowHeader
 *     title="Doná ahora"
 *     logo="https://cdn.ejemplo.org/logo.svg"
 *   />
 *
 * Con descripción extendida (múltiples párrafos):
 *   <FlowHeader title="Actualizá tu donación" logo="/logos/mi-org.png">
 *     <p>Primer párrafo de la descripción...</p>
 *     <p>Segundo párrafo con más detalle...</p>
 *   </FlowHeader>
 *
 * Personalización del logo:
 *   - logoAlt: texto alternativo para accesibilidad (default: "Logo")
 *   - logoClass: clases CSS extra para el <img> (default: "h-10")
 *
 * Para agregar tu logo:
 *   1. Poné tu archivo en public/logos/ (ej: public/logos/mi-org.png)
 *   2. Referencialo con logo="/logos/mi-org.png"
 *   3. Formatos recomendados: SVG (mejor calidad), PNG con fondo transparente
 *   4. Tamaño sugerido: altura 40-80px, ancho libre
 */

interface Props {
  /** Título principal del formulario */
  title: string;
  /** Descripción opcional debajo del título */
  description?: string;
  /** URL del logo (relativa a public/ o URL externa) */
  logo?: string;
  /** Texto alternativo del logo para accesibilidad */
  logoAlt?: string;
  /** Clases CSS adicionales para el logo */
  logoClass?: string;
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  logo: undefined,
  logoAlt: "Logo",
  logoClass: "h-10",
});
</script>

<template>
  <header class="mb-5 space-y-1.5">
    <img
      v-if="logo"
      :src="logo"
      :alt="logoAlt"
      :class="['mb-3 max-w-[200px] object-contain', logoClass]"
    />
    <h1 class="text-lg font-semibold text-foreground sm:text-xl">
      {{ title }}
    </h1>
    <p
      v-if="description"
      class="text-sm leading-relaxed text-muted-foreground"
    >
      {{ description }}
    </p>
    <!-- Slot para contenido extra (descripciones largas, múltiples párrafos, etc.) -->
    <slot />
  </header>
</template>
