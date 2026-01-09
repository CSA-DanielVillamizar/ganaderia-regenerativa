/**
 * Guías de Campo Interactivas - Épica 8
 * 
 * Proporciona checklists paso a paso para actividades de campo
 */

export interface FieldGuideStep {
  id: string;
  number: number;
  title: string;
  description: string;
  tips: string[];
  warnings?: string[];
  imageUrl?: string;
}

export interface FieldGuide {
  id: string;
  name: string;
  category: 'WEIGHING' | 'FORAGE' | 'MOVEMENT' | 'GENERAL';
  description: string;
  duration: number; // minutos
  steps: FieldGuideStep[];
  materials?: string[];
  safetyNotes?: string[];
}

export const FIELD_GUIDES: Record<string, FieldGuide> = {
  WEIGHING_WITH_TAPE: {
    id: 'weighing_tape',
    name: 'Pesaje por Cinta Métrica',
    category: 'WEIGHING',
    description: 'Técnica para estimar peso de animales sin báscula portátil',
    duration: 15,
    materials: [
      'Cinta métrica (mínimo 2 metros)',
      'Libreta y bolígrafo',
      'Cuerdas o lazos',
      'Corrales de contención',
    ],
    steps: [
      {
        id: 'step1',
        number: 1,
        title: 'Preparar el animal',
        description: 'Asegurar que el animal esté calmado y en posición erguida',
        tips: [
          'Usar animales ya domesticados',
          'Medir en hora fresca (mañana temprano)',
          'Evitar medir después de alimentar',
        ],
        warnings: [
          'No medir animales estresados',
          'Tener personal de seguridad presente',
        ],
      },
      {
        id: 'step2',
        number: 2,
        title: 'Medir perímetro torácico',
        description: 'Rodear el pecho justo detrás de las axilas',
        tips: [
          'La cinta debe estar perpendicular al cuerpo',
          'Apretada pero sin comprimir músculos',
          'Anotar medida en cm',
          'Repetir 2-3 veces y promediar',
        ],
      },
      {
        id: 'step3',
        number: 3,
        title: 'Medir largo corporal',
        description: 'De la punta del esternón a la punta de la grupa',
        tips: [
          'Mantener animal en línea recta',
          'La cinta debe ser tensa pero no apretada',
          'Anotar en cm',
          'Repetir 2-3 veces y promediar',
        ],
      },
      {
        id: 'step4',
        number: 4,
        title: 'Aplicar fórmula',
        description: 'Calcular peso estimado usando Bovonómia',
        tips: [
          'Fórmula: (Perímetro² × Largo) ÷ Divisor',
          'Divisor default: 11877 (ajustable por calibración)',
          'Usar calculadora o aplicación',
          'Anotar peso estimado vs real si tienes báscula',
        ],
      },
    ],
    safetyNotes: [
      'Usar siempre equipo de protección (casco, botas)',
      'Tener vía de escape clara',
      'No acercarse por detrás del animal',
      'Mantener distancia segura de cascos y cuernos',
    ],
  },

  FORAGE_SAMPLING: {
    id: 'forage_sampling',
    name: 'Aforo de Forraje',
    category: 'FORAGE',
    description: 'Técnica estandarizada para muestreo de disponibilidad forrajera',
    duration: 45,
    materials: [
      'Marco de muestreo (0.25 m², 1 m², o 4 m²)',
      'Bascula de precisión (±100g)',
      'Bolsas de papel o tela',
      'Secador solar o horno',
      'Libreta de campo',
      'GPS o croquis del potrero',
    ],
    steps: [
      {
        id: 'step1',
        number: 1,
        title: 'Seleccionar sitios de muestreo',
        description: 'Elegir puntos representativos del potrero',
        tips: [
          'Mínimo 5 puntos por potrero',
          'Distribuir uniformemente',
          'Incluir áreas altas, medias y bajas',
          'Evitar bordes y senderos de animales',
          'Anotar geolocalización de cada punto',
        ],
      },
      {
        id: 'step2',
        number: 2,
        title: 'Colocar marco de muestreo',
        description: 'Posicionar el marco en el punto seleccionado',
        tips: [
          'Marco 0.25 m² = 50cm × 50cm (rápido)',
          'Marco 1 m² = 100cm × 100cm (estándar)',
          'Marco 4 m² = 200cm × 200cm (completo)',
          'Asegurar que quede perpendicular al terreno',
        ],
      },
      {
        id: 'step3',
        number: 3,
        title: 'Cortar forraje a altura de pastoreo',
        description: 'Siega del material dentro del marco',
        tips: [
          'Altura típica: 5 cm del suelo',
          'Usar hoz o machete afilado',
          'Incluir todas las plantas dentro',
          'No compactar material',
        ],
      },
      {
        id: 'step4',
        number: 4,
        title: 'Pesar forraje fresco',
        description: 'Anotar peso inmediato de la muestra',
        tips: [
          'Pesar en bolsa impermeable',
          'Restar peso de bolsa',
          'Repetir en 3 puntos mínimo',
          'Promediar para dato final',
        ],
      },
      {
        id: 'step5',
        number: 5,
        title: 'Secar muestra',
        description: 'Determinar porcentaje de materia seca',
        tips: [
          'Opción 1: Horno a 65°C por 48h',
          'Opción 2: Secador solar por 4-5 días',
          'Pesar nuevamente cuando esté completamente seco',
          'Calcular % MS = (peso seco / peso fresco) × 100',
        ],
      },
      {
        id: 'step6',
        number: 6,
        title: 'Calcular kg MS/ha',
        description: 'Proyectar disponibilidad a hectárea',
        tips: [
          'kg MS/ha = (kg MS muestra / área marco) × 10000',
          'Ejemplo: 2 kg MS en 1m² = (2 / 1) × 10000 = 20,000 kg MS/ha',
          'Aplicar factor de aprovechamiento (40-70%)',
          'Registrar en app con cálculo automático',
        ],
      },
    ],
    safetyNotes: [
      'Revisar terreno antes de entrar (hoyos, serpientes)',
      'Usar botas de caña alta',
      'Llevar teléfono y water',
      'Informar a alguien dónde vas',
    ],
  },

  PADDOCK_ROTATION: {
    id: 'paddock_rotation',
    name: 'Rotación de Potreros',
    category: 'MOVEMENT',
    description: 'Protocolo para cambios seguros de potrero',
    duration: 30,
    steps: [
      {
        id: 'step1',
        number: 1,
        title: 'Preparar potrero destino',
        description: 'Verificar condiciones del nuevo potrero',
        tips: [
          'Revisar agua disponible',
          'Confirmar cercas en buen estado',
          'Limpiar residuos peligrosos',
          'Abrir tranqueras/puertas',
        ],
      },
      {
        id: 'step2',
        number: 2,
        title: 'Reunir el rebaño',
        description: 'Calmar y agrupar animales',
        tips: [
          'Evitar ruidos fuertes',
          'Usar comida para atraer si es necesario',
          'No usar perros sin entrenamiento',
        ],
      },
      {
        id: 'step3',
        number: 3,
        title: 'Trasladar con seguridad',
        description: 'Conducir animales sin estrés',
        tips: [
          'Velocidad lenta y constante',
          'Mantener grupos unidos',
          'Tener personal en puntos estratégicos',
          'Vigilar rezagados',
        ],
      },
      {
        id: 'step4',
        number: 4,
        title: 'Cerrar rotación anterior',
        description: 'Aislar el potrero desocupado',
        tips: [
          'Cerrar tranqueras',
          'Registrar fecha de salida',
          'Anotar días de ocupación',
          'Marcar inicio del descanso',
        ],
      },
      {
        id: 'step5',
        number: 5,
        title: 'Registrar movimiento',
        description: 'Documentar en app',
        tips: [
          'Anotar hora exacta del movimiento',
          'Registrar condiciones del potrero anterior',
          'Foto de rebaño en nueva ubicación',
          'Notar comportamiento de animales',
        ],
      },
    ],
    safetyNotes: [
      'Usar chalecos reflectivos si está anocheciendo',
      'Tener vías de escape claras',
      'Vigilar animales agresivos o asustados',
    ],
  },

  HEALTH_MONITORING: {
    id: 'health_monitoring',
    name: 'Monitoreo de Salud Básico',
    category: 'GENERAL',
    description: 'Inspección diaria rápida de rebaño',
    duration: 15,
    steps: [
      {
        id: 'step1',
        number: 1,
        title: 'Observar comportamiento general',
        description: 'Estado físico y mental del rebaño',
        tips: [
          'Animales deben estar comiendo o descansando',
          'Buscar animales separados del grupo',
          'Notar cambios de postura o movimiento',
          'Escuchar sonidos anormales',
        ],
      },
      {
        id: 'step2',
        number: 2,
        title: 'Revisar agua y sombra',
        description: 'Acceso a recursos básicos',
        tips: [
          'Agua: limpia, sin algas, suficiente',
          'Sombra: disponible en horas calurosas',
          'Protección: de lluvia y viento',
        ],
      },
      {
        id: 'step3',
        number: 3,
        title: 'Inspeccionar de cerca',
        description: 'Examinar animales sospechosos',
        tips: [
          'Ojos: brillantes, sin lagañas',
          'Pelaje: limpio, sin costras',
          'Cascos: sin cojeras evidentes',
          'Escroto (machos): sin inflamación',
        ],
      },
      {
        id: 'step4',
        number: 4,
        title: 'Documentar hallazgos',
        description: 'Registro de observaciones',
        tips: [
          'Anotar animales con problemas',
          'Describir síntomas observados',
          'Hora y condiciones climáticas',
          'Contactar veterinario si es grave',
        ],
      },
    ],
  },
};

/**
 * Hook para acceder a guías de campo
 */
export function useFieldGuide(guideId: string) {
  return FIELD_GUIDES[guideId];
}

/**
 * Hook para obtener guías por categoría
 */
export function useFieldGuidesByCategory(category: FieldGuide['category']) {
  return Object.values(FIELD_GUIDES).filter((guide) => guide.category === category);
}
