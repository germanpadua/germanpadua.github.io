/**
 * UI strings.
 *
 * Spanish is the source of truth for the shape: `Dictionary` is derived from it,
 * so a missing English key is a type error rather than an empty element on the
 * English site. Content that belongs to a single project or job lives in
 * `src/content/`, not here.
 */

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

export const identity = {
  name: 'Germán Padua',
  shortName: 'Germán Padua',
  email: 'german.padua@outlook.es',
  github: 'https://github.com/germanpadua',
  githubHandle: 'germanpadua',
  linkedin: 'https://www.linkedin.com/in/german-jose-padua-pleguezuelo',
  location: { es: 'Almería, España', en: 'Almería, Spain' },
  site: 'https://germanpadua.github.io',
} as const;

const es = {
  lang: 'es',
  htmlLang: 'es-ES',
  ogLocale: 'es_ES',
  meta: {
    title: 'Germán Padua · Ingeniero informático y matemático',
    description:
      'Matemático, ingeniero informático y científico de datos. Modelos de riesgo, aprendizaje sobre grafos, telemetría y aplicaciones de inteligencia artificial.',
  },
  nav: {
    label: 'Navegación principal',
    about: 'Perfil',
    work: 'Experiencia',
    projects: 'Proyectos',
    skills: 'Conocimientos',
    education: 'Formación',
    playground: 'Circuito',
    contact: 'Contacto',
    menu: 'Menú',
    closeMenu: 'Cerrar menú',
    themeLabel: 'Tema visual',
    languageLabel: 'English',
    languageHref: '/en/',
    languageShort: 'EN',
  },
  hero: {
    eyebrow: 'Matemáticas · Ingeniería · Ciencia de datos',
    greeting: 'Hola, soy',
    headline: 'De las matemáticas a los productos de datos.',
    support:
      'Soy matemático, ingeniero informático y científico de datos. Trabajo en modelos de riesgo de crédito y desarrollo proyectos de aprendizaje automático, IA y visualización. Me interesa entender el problema y construir algo que lo resuelva.',
    primaryAction: 'Ver los proyectos',
    secondaryAction: 'Experiencia',
  },
  profile: {
    eyebrow: 'Perfil',
    title: 'Entender, experimentar, construir.',
    lead: 'Una base matemática y una forma práctica de trabajar.',
    paragraphs: [
      'Elegí el doble grado en Matemáticas e Ingeniería Informática porque me gusta entender cómo funcionan las cosas y tener las herramientas para construirlas. El máster en Ciencia de Datos me permitió conectar ambas partes con problemas reales.',
      'En BCC · Grupo Cajamar trabajo en la calibración y seguimiento de modelos de riesgo de crédito. Me ocupo del recorrido completo: preparar los datos, desarrollar el modelo, analizar sus resultados y explicarlos a los equipos de riesgo y validación.',
      'En mis proyectos exploro esa misma conexión entre ideas y aplicaciones: redes neuronales con geometría no euclídea, olivares vistos desde un satélite y agentes que convierten una conversación en acciones. Disfruto tanto del análisis como de hacer que el resultado se pueda usar.',
    ],
    pillars: [
      { label: 'Fundamentos', detail: 'Estadística, optimización y geometría para comprender los modelos y sus supuestos.' },
      { label: 'Experimentación', detail: 'Comparar alternativas, revisar los datos e interpretar lo que muestran los resultados.' },
      { label: 'Aplicaciones', detail: 'Pipelines, interfaces y automatizaciones que acercan el modelo a quien lo necesita.' },
    ],
  },
  sections: {
    about: { eyebrow: 'Perfil', title: 'Perfil', lead: '' },
    work: { eyebrow: 'Trayectoria', title: 'Experiencia', lead: '' },
    projects: {
      eyebrow: 'Trabajo',
      title: 'Proyectos',
      lead: 'Una selección de investigación, ingeniería y aplicaciones.',
    },
    skills: {
      eyebrow: 'Herramientas',
      title: 'Conocimientos en práctica',
      lead: 'Del fundamento a la herramienta, y de la herramienta al proyecto.',
      cta: 'Abrir el mapa interactivo',
      previewDescription:
        'Vista previa del mapa de conocimientos: un punto por área, con el tamaño según cuántos conocimientos reúne. Es solo un avance; el mapa completo, con nivel y frescura, está en su propia página.',
      areas: 'áreas',
      skills: 'conocimientos',
    },
    highlights: {
      eyebrow: 'Reconocimientos',
      title: 'Selecciones y competiciones',
      lead: 'Experiencias que amplían mi formación y me acercan a otros equipos.',
    },
    offClock: {
      eyebrow: 'Fuera del reloj',
      title: 'Fuera del reloj',
      lead: 'Lo que hago cuando no estoy trabajando en esto. O cuando sí.',
    },
    education: { eyebrow: 'Formación', title: 'Formación y certificaciones', lead: '' },
    playground: {
      eyebrow: 'Una pausa',
      title: 'Una vuelta más',
      lead: 'También me gusta la Fórmula 1. Aquí puedes probar una vuelta de clasificación.',
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Hablemos',
      lead: 'Si tienes un problema de datos, un modelo que no termina de cuadrar o una posición que encaje, escríbeme.',
      emailLabel: 'Escríbeme',
      githubLabel: 'GitHub',
      linkedinLabel: 'LinkedIn',
    },
  },
  playground: {
    terminal: {
      title: 'Terminal',
      description:
        'Navega el sitio con comandos. Escribe help para empezar, o usa el tabulador para completar.',
      cta: 'Abrir terminal',
    },
    graph: {
      title: 'Grafo de skills',
      description:
        'Las skills como un grafo: qué sé, con qué se conecta y en qué proyecto lo usé.',
      cta: 'Explorar el grafo',
    },
    game: {
      title: 'Vuelta de clasificación',
      description:
        'Un minijuego de F1 en dos dimensiones: traza la vuelta, frena a tiempo y los tres sectores deciden.',
      cta: 'Salir a pista',
    },
  },
  footer: {
    nav: 'Navegación',
    elsewhere: 'En otros sitios',
    built: 'Diseñado y desarrollado por Germán Padua.',
    themeNote: 'Cuatro temas, un solo diseño.',
    rights: 'Contenido y diseño',
    backToTop: 'Volver arriba',
  },
  provenance: {
    label: 'Procedencia',
    artifact: 'artefacto en el repositorio',
    measured: 'medido',
    record: 'expediente',
    target: 'objetivo, no resultado',
    unverified: 'sin verificar',
    source: 'Fuente',
  },
  projects: {
    featured: 'Proyectos destacados',
    more: 'Otros proyectos',
    role: 'Rol',
    period: 'Periodo',
    status: 'Estado',
    stack: 'Tecnologías',
    limits: 'Alcance y limitaciones',
    metrics: 'Números',
    team: 'Equipo',
    contribution: 'Mi aporte',
    repo: 'Ver el repositorio',
    demo: 'Ver el proyecto',
    writeup: 'Leer más',
    caseStudy: 'Leer el caso completo',
    privateNote: 'Caso de estudio',
    statuses: {
      shipped: 'terminado',
      'in-progress': 'en curso',
      research: 'investigación',
    },
  },
  education: {
    degrees: 'Titulaciones',
    certifications: 'Certificaciones',
    languages: 'Idiomas',
    kinds: {
      degree: 'Grado',
      master: 'Máster',
      certification: 'Certificación',
      language: 'Idioma',
    },
  },
  highlightsExtra: {
    kinds: {
      program: 'Programa',
      competition: 'Competición',
      award: 'Reconocimiento',
      publication: 'Publicación',
      contribution: 'Contribución',
    },
  },
  offClock: {
    interests: 'Fuera del reloj',
  },
  terminal: {
    inputLabel: 'Entrada de la terminal',
    cleared: 'Pantalla limpia.',
    loading: 'Cargando los datos del sitio…',
    failed: 'No se pudieron cargar los datos del sitio.',
  },
  skillsExtra: {
    levels: {
      high: 'Nivel alto',
      medium: 'Nivel medio',
      low: 'Nivel básico',
    },
    usedIn: 'Usado en',
    areas: 'Áreas',
    graphHint: 'La lista de abajo es la misma información en texto. El grafo es la capa que necesita JavaScript.',
  },
  graph: {
    title: 'Grafo de skills',
    areas: 'Filtrar por área',
    reset: 'Restablecer',
    noMatches: 'Ninguna skill coincide con la búsqueda.',
    showAll: 'Mostrar todas',
    hint: 'Selecciona un conocimiento para ver dónde lo aplico.',
    usedIn: 'Usado en',
    empty: 'No queda ninguna área seleccionada.',
    canvasLabel: 'Grafo de skills: nodos agrupados por área y unidos por relaciones de uso, aplicación, extensión y afinidad.',
    level: {
      strong: 'Sólido',
      working: 'En práctica',
      basic: 'Básico',
    },
    freshness: {
      current: 'Al día',
      warming: 'Enfriando',
      stale: 'Antiguo',
      unknown: 'Sin señal',
    },
    layers: 'Capas',
    legend: 'Leyenda',
    search: 'Buscar',
    searchPlaceholder: 'Buscar una skill…',
    jumpTo: 'Ir a un conocimiento',
    clear: 'Limpiar',
    lastReviewed: 'Última revisión',
    levelRule: 'Nivel: sólido ≥ 0,85 · en práctica ≥ 0,70 · básico por debajo.',
    freshnessRule:
      'Frescura: al día 2025-2026 · enfriando 2023-2024 · sin señal si no hay proyecto ni formación.',
    hud: 'Controles del mapa',
    core: 'Conocimientos',
    close: 'Cerrar panel',
    zoom: 'Zoom',
    levelLabel: 'Nivel',
    freshnessLabel: 'Frescura',
    lastActivity: 'Última actividad',
    layerNames: {
      lines: 'Relaciones',
      areaLabels: 'Etiquetas de área',
      skillLabels: 'Etiquetas de skill',
      levels: 'Anillos de nivel',
      grid: 'Cuadrícula de fondo',
    },
    selected: 'Seleccionado',
    listLabel: 'Las mismas skills, en texto',
    loading: 'Cargando el grafo…',
    failed: 'No se pudo cargar el grafo. La lista de abajo tiene la misma información.',
  },
  game: {
    title: 'Vuelta de clasificación',
    start: 'Salir a pista',
    restart: 'Reiniciar',
    resume: 'Continuar',
    paused: 'En pausa',
    lap: 'Vuelta',
    best: 'Mejor',
    last: 'Última',
    sector: 'Sector',
    speed: 'Velocidad',
    offTrack: '¡Fuera de pista!',
    sliding: 'Sin agarre',
    record: 'Récord personal',
    noRecord: 'Todavía no hay ninguna vuelta registrada.',
    sectors: 'Análisis por sector',
    delta: 'Delta',
    controls: 'Acelera, frena y gira. Reduce la velocidad antes de las curvas para mantener el agarre.',
    throttle: 'Acelerar',
    brake: 'Frenar',
    keyboard: 'Teclado: ↑ acelerar · ↓ frenar · ← → trazar · espacio pausa · R reinicia',
    touch: 'Táctil: los botones de abajo',
    finished: 'Vuelta completada',
    clearance: 'Vuelta limpia',
  },
  notFound: {
    title: 'Página no encontrada',
    lead: 'Esa ruta no existe. Como estamos en una terminal, podrías intentar help.',
    cta: 'Volver al inicio',
  },
  lab: {
    title: 'Laboratorio de temas',
    lead: 'Los cuatro temas completos, lado a lado, sobre el mismo marcado. Elige uno y se convierte en el tema por defecto.',
    noindex: 'Página de trabajo interno. No indexar.',
    specimen: 'Muestra tipográfica',
    palette: 'Paleta',
    components: 'Componentes',
    graph: 'Categorías del grafo',
    dimensions: 'Métricas',
    note: 'Nota',
    bodySample:
      'Un modelo no vale por su métrica en validación, sino por lo que aguanta cuando alguien externo lo audita: trazabilidad del dato, supuestos explícitos y un resultado que se puede reproducir seis meses después.',
    codeSample: 'sentinel detect --session monza-2023 --budget 0.05',
    metricLabels: {
      tests: 'Tests',
      coverage: 'Cobertura',
      latency: 'Latencia p95',
      dataset: 'Registros',
      score: 'Métrica',
    },
  },
} as const;

/**
 * Widen the literal types that `as const` produces, so the English dictionary is
 * checked for the same *shape* as the Spanish one instead of having to repeat the
 * exact same strings. Missing or misspelled keys stay a compile error.
 */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof es>;

const en: Dictionary = {
  lang: 'en',
  htmlLang: 'en-GB',
  ogLocale: 'en_GB',
  meta: {
    title: 'Germán Padua · Computer engineer and mathematician',
    description:
      'Mathematician, computer engineer and data scientist. Credit risk models, graph learning, telemetry and AI applications.',
  },
  nav: {
    label: 'Main navigation',
    about: 'Profile',
    work: 'Experience',
    projects: 'Projects',
    skills: 'Skills',
    education: 'Education',
    playground: 'Playground',
    contact: 'Contact',
    menu: 'Menu',
    closeMenu: 'Close menu',
    themeLabel: 'Visual theme',
    languageLabel: 'Español',
    languageHref: '/',
    languageShort: 'ES',
  },
  hero: {
    eyebrow: 'Mathematics · Engineering · Data science',
    greeting: "Hi, I'm",
    headline: 'From mathematics to data products.',
    support:
      'I’m a mathematician, computer engineer and data scientist. I work on credit risk models and build machine learning, AI and visualisation projects. I like understanding a problem and building something that solves it.',
    primaryAction: 'See the projects',
    secondaryAction: 'Experience',
  },
  profile: {
    eyebrow: 'Profile',
    title: 'Understand, experiment, build.',
    lead: 'A mathematical foundation and a practical approach.',
    paragraphs: [
      'I chose Mathematics and Computer Engineering because I enjoy understanding how things work and having the tools to build them. A master’s in Data Science connected those interests to real problems.',
      'At BCC · Grupo Cajamar I work on credit risk model calibration and monitoring. I cover the full process: preparing data, developing the model, analysing results and explaining them to risk and validation teams.',
      'My projects explore the same link between ideas and applications: neural networks with non-Euclidean geometry, olive groves viewed from a satellite and agents that turn conversations into actions. I enjoy the analysis as much as making the result useful.',
    ],
    pillars: [
      { label: 'Foundations', detail: 'Statistics, optimisation and geometry to understand models and their assumptions.' },
      { label: 'Experiments', detail: 'Comparing alternatives, reviewing data and interpreting the results.' },
      { label: 'Applications', detail: 'Pipelines, interfaces and automations that bring models to the people who need them.' },
    ],
  },
  sections: {
    about: { eyebrow: 'Profile', title: 'Profile', lead: '' },
    work: { eyebrow: 'Track record', title: 'Experience', lead: '' },
    projects: { eyebrow: 'Work', title: 'Projects', lead: 'Selected research, engineering and applications.' },
    skills: {
      eyebrow: 'Toolbox',
      title: 'Knowledge in practice',
      lead: 'From foundations to tools, and from tools to projects.',
      cta: 'Open the interactive map',
      previewDescription:
        'A preview of the knowledge map: one dot per area, sized by how many skills it holds. It is only a preview; the full map, with level and freshness, has its own page.',
      areas: 'areas',
      skills: 'skills',
    },
    highlights: {
      eyebrow: 'Recognition',
      title: 'Selections and competitions',
      lead: 'Experiences that broaden my learning and connect me with other teams.',
    },
    offClock: {
      eyebrow: 'Off the clock',
      title: 'Off the clock',
      lead: 'What I do when I am not working on this. Or when I am.',
    },
    education: { eyebrow: 'Background', title: 'Education and certifications', lead: '' },
    playground: {
      eyebrow: 'A short break',
      title: 'One more lap',
      lead: 'I also enjoy Formula 1. Try a qualifying lap here.',
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's talk",
      lead: 'If you have a data problem, a model that will not quite add up, or a role that fits, get in touch.',
      emailLabel: 'Email me',
      githubLabel: 'GitHub',
      linkedinLabel: 'LinkedIn',
    },
  },
  playground: {
    terminal: {
      title: 'Terminal',
      description:
        'Navigate the site with commands. Type help to start, or press tab to complete.',
      cta: 'Open terminal',
    },
    graph: {
      title: 'Skill graph',
      description: 'Skills as a graph: what I know, what it connects to, and where I used it.',
      cta: 'Explore the graph',
    },
    game: {
      title: 'Qualifying lap',
      description:
        'A two-dimensional F1 mini-game: trace the lap, brake in time, and let the three sectors decide.',
      cta: 'Take to the track',
    },
  },
  footer: {
    nav: 'Navigation',
    elsewhere: 'Elsewhere',
    built: 'Designed and built by Germán Padua.',
    themeNote: 'Four themes, one design.',
    rights: 'Content and design',
    backToTop: 'Back to top',
  },
  provenance: {
    label: 'Provenance',
    artifact: 'artifact in the repository',
    measured: 'measured',
    record: 'academic record',
    target: 'target, not a result',
    unverified: 'unverified',
    source: 'Source',
  },
  projects: {
    featured: 'Featured projects',
    more: 'More projects',
    role: 'Role',
    period: 'Period',
    status: 'Status',
    stack: 'Stack',
    limits: 'Scope and limitations',
    metrics: 'Numbers',
    team: 'Team',
    contribution: 'My contribution',
    repo: 'View the repository',
    demo: 'View the project',
    writeup: 'Read more',
    caseStudy: 'Read the full case study',
    privateNote: 'Case study',
    statuses: {
      shipped: 'shipped',
      'in-progress': 'in progress',
      research: 'research',
    },
  },
  education: {
    degrees: 'Degrees',
    certifications: 'Certifications',
    languages: 'Languages',
    kinds: {
      degree: 'Degree',
      master: "Master's",
      certification: 'Certification',
      language: 'Language',
    },
  },
  highlightsExtra: {
    kinds: {
      program: 'Programme',
      competition: 'Competition',
      award: 'Award',
      publication: 'Publication',
      contribution: 'Contribution',
    },
  },
  offClock: {
    interests: 'Off the clock',
  },
  terminal: {
    inputLabel: 'Terminal input',
    cleared: 'Screen cleared.',
    loading: 'Loading the site data…',
    failed: 'The site data could not be loaded.',
  },
  skillsExtra: {
    levels: {
      high: 'Strong',
      medium: 'Working',
      low: 'Basic',
    },
    usedIn: 'Used in',
    areas: 'Areas',
    graphHint: 'The list below is the same information in text. The graph is the layer that needs JavaScript.',
  },
  graph: {
    title: 'Skill graph',
    areas: 'Filter by area',
    reset: 'Reset',
    noMatches: 'No skill matches the search.',
    showAll: 'Show all',
    hint: 'Hover a node to see what it connects to, and click to read the note. You can drag them.',
    usedIn: 'Used in',
    empty: 'No area is selected.',
    canvasLabel: 'Skill graph: nodes grouped by area and joined by relationships of use, application, extension and affinity.',
    level: {
      strong: 'Strong',
      working: 'Working',
      basic: 'Basic',
    },
    freshness: {
      current: 'Current',
      warming: 'Warming',
      stale: 'Stale',
      unknown: 'No signal',
    },
    layers: 'Layers',
    legend: 'Legend',
    search: 'Search',
    searchPlaceholder: 'Search a skill…',
    jumpTo: 'Jump to a skill',
    clear: 'Clear',
    lastReviewed: 'Last reviewed',
    levelRule: 'Level: strong ≥ 0.85 · working ≥ 0.70 · basic below.',
    freshnessRule:
      'Freshness: current 2025-2026 · warming 2023-2024 · no signal when there is neither a project nor coursework.',
    hud: 'Map controls',
    core: 'Skills',
    close: 'Close panel',
    zoom: 'Zoom',
    levelLabel: 'Level',
    freshnessLabel: 'Freshness',
    lastActivity: 'Last activity',
    layerNames: {
      lines: 'Edges',
      areaLabels: 'Area labels',
      skillLabels: 'Skill labels',
      levels: 'Level rings',
      grid: 'Background grid',
    },
    selected: 'Selected',
    listLabel: 'The same skills, in text',
    loading: 'Loading the graph…',
    failed: 'The graph could not be loaded. The list below has the same information.',
  },
  game: {
    title: 'Qualifying lap',
    start: 'Take to the track',
    restart: 'Restart',
    resume: 'Resume',
    paused: 'Paused',
    lap: 'Lap',
    best: 'Best',
    last: 'Last',
    sector: 'Sector',
    speed: 'Speed',
    offTrack: 'Off track!',
    sliding: 'No grip',
    record: 'Personal best',
    noRecord: 'No lap on record yet.',
    sectors: 'Sector analysis',
    delta: 'Delta',
    controls: 'Throttle, brake and steer. Brake before the corner or you will lose grip.',
    throttle: 'Throttle',
    brake: 'Brake',
    keyboard: 'Keyboard: ↑ throttle · ↓ brake · ← → steer · space pause · R restart',
    touch: 'Touch: the buttons below',
    finished: 'Lap complete',
    clearance: 'Clean lap',
  },
  notFound: {
    title: 'Page not found',
    lead: 'That route does not exist. Since this is a terminal, you could try help.',
    cta: 'Back to the home page',
  },
  lab: {
    title: 'Theme laboratory',
    lead: 'All four themes, side by side, over identical markup. Pick one and it becomes the default.',
    noindex: 'Internal working page. Do not index.',
    specimen: 'Type specimen',
    palette: 'Palette',
    components: 'Components',
    graph: 'Graph categories',
    dimensions: 'Metrics',
    note: 'Note',
    bodySample:
      'A model is not worth its validation metric, but what it withstands when someone outside audits it: data lineage, explicit assumptions, and a result that reproduces six months later.',
    codeSample: 'sentinel detect --session monza-2023 --budget 0.05',
    metricLabels: {
      tests: 'Tests',
      coverage: 'Coverage',
      latency: 'p95 latency',
      dataset: 'Records',
      score: 'Metric',
    },
  },
};

export const dictionaries: Record<Locale, Dictionary> = { es, en };

export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export const themeIds = ['atlas', 'tinta', 'phosphor', 'nebula'] as const;
export type ThemeId = (typeof themeIds)[number];

export const themeMeta: Record<
  ThemeId,
  { label: string; hint: Record<Locale, string>; scheme: 'light' | 'dark' }
> = {
  atlas: {
    label: 'Atlas',
    hint: { es: 'Papel y tinta, editorial científica', en: 'Paper and ink, scientific editorial' },
    scheme: 'light',
  },
  tinta: {
    label: 'Tinta',
    hint: { es: 'El atlas de noche', en: 'The atlas after dark' },
    scheme: 'dark',
  },
  phosphor: {
    label: 'Phosphor',
    hint: { es: 'Terminal CRT verde fósforo', en: 'Green CRT terminal' },
    scheme: 'dark',
  },
  nebula: {
    label: 'Nebula',
    hint: { es: 'Data-viz sobre pizarra oscura', en: 'Dark data-viz slate' },
    scheme: 'dark',
  },
};
