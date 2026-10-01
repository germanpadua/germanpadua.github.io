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
  name: 'German Padua',
  shortName: 'German Padua',
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
    title: 'German Padua · Ingeniero informático y matemático',
    description:
      'Ingeniero informático y matemático. Construyo modelos y sistemas de datos que aguantan una auditoría: riesgo de crédito bajo IFRS 9, detección causal de anomalías y plataformas de IA en producción.',
  },
  nav: {
    label: 'Navegación principal',
    about: 'Perfil',
    work: 'Experiencia',
    projects: 'Proyectos',
    skills: 'Skills',
    education: 'Formación',
    playground: 'Playground',
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
    headline: 'Construyo modelos y sistemas que aguantan una auditoría.',
    support:
      'Doble grado en Ingeniería Informática y Matemáticas, máster en Ciencia de Datos. Hoy trabajo en riesgo de crédito bajo IFRS 9 y, fuera del banco, en detección causal de anomalías y plataformas de IA autoalojadas.',
    primaryAction: 'Ver los proyectos',
    secondaryAction: 'Experiencia',
    stats: [
      { value: '9,9/10', label: 'TFG en redes neuronales sobre variedades pseudo-riemannianas' },
      { value: '8,59/10', label: 'Máster en Ciencia de Datos, Universidad de Granada' },
      { value: '90/105.000', label: 'Santander AI Experience @ IE, julio 2026' },
    ],
  },
  profile: {
    eyebrow: 'Perfil',
    title: 'matemáticas + informática + datos',
    lead: 'Los tres ejes, y por qué juntos valen más que por separado.',
    paragraphs: [
      'Estudié Matemáticas e Informática porque me atraen los problemas que hay que entender de verdad antes de resolverlos, no los que se resuelven aplicando algo que ya sabes. Hice las dos carreras a la vez, después un máster en Ciencia de Datos, y de ahí me quedó una manía útil: cuando un resultado me gusta demasiado, lo vuelvo a mirar.',
      'Trabajo en riesgo de crédito bajo el marco IFRS 9, donde soy responsable de la calibración, la monitorización y la proyección del parámetro LGD. Es un entorno donde un modelo no vale por su métrica en validación, sino por lo que aguanta cuando alguien de fuera audita el dato, los supuestos y la documentación seis meses después.',
      'Lo que me interesa no es modelar en aislamiento: es el proceso completo. Entender el problema, diseñar, iterar y hacer que el resultado sirva para algo. Fuera del banco construyo lo mismo por gusto: detección causal de anomalías sobre telemetría pública de Fórmula 1, pasarelas de inferencia autoalojadas con evaluación instrumentada, y flujos que convierten notas de voz en documentos revisables. Si algo no se puede reproducir, no está terminado.',
    ],
    pillars: [
      {
        label: 'Matemáticas',
        detail:
          'Estadística, álgebra lineal, optimización y geometría diferencial. El formalismo no decora: es lo que te dice cuándo un modelo está mal antes de que lo diga producción.',
      },
      {
        label: 'Informática',
        detail:
          'Sistemas que corren de verdad: pipelines, contenedores, integración continua y tests. Un cuaderno de Jupyter no es un producto.',
      },
      {
        label: 'Ciencia de datos',
        detail:
          'Del dato crudo a la decisión, con trazabilidad. Modelos de riesgo, detección de anomalías, visión por computador y LLMs en producción.',
      },
    ],
  },
  sections: {
    about: { eyebrow: 'Perfil', title: 'Perfil', lead: '' },
    work: { eyebrow: 'Trayectoria', title: 'Experiencia', lead: '' },
    projects: {
      eyebrow: 'Trabajo',
      title: 'Proyectos',
      lead: 'Sistemas que he diseñado, construido y medido.',
    },
    skills: { eyebrow: 'Herramientas', title: 'Skills', lead: '' },
    highlights: {
      eyebrow: 'Reconocimientos',
      title: 'Selecciones y competiciones',
      lead: 'Cosas que no son un trabajo ni un título y que, sin embargo, explican bastante.',
    },
    offClock: {
      eyebrow: 'Fuera del reloj',
      title: 'Fuera del reloj',
      lead: 'Lo que hago cuando no estoy trabajando en esto. O cuando sí.',
    },
    education: { eyebrow: 'Formación', title: 'Formación y certificaciones', lead: '' },
    playground: {
      eyebrow: 'Playground',
      title: 'Playground',
      lead: 'Tres formas de tocar el sitio: una terminal, un grafo de skills y una vuelta de clasificación.',
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
    built: 'Hecho con Astro. Sin JavaScript en el documento: solo las tres capas interactivas lo cargan.',
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
    limits: 'Lo que no reclamo',
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
    share: 'Ejecutar',
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
    reset: 'Reorganizar',
    hint: 'Pasá el cursor por encima de un nodo para ver qué conecta, y hacé clic para leer la nota. Podés arrastrarlos.',
    usedIn: 'Usado en',
    empty: 'No queda ninguna área seleccionada.',
    canvasLabel: 'Grafo de skills: nodos agrupados por área y unidos por relaciones de uso, aplicación, extensión y afinidad.',
    selected: 'Seleccionado',
    listLabel: 'Las mismas skills, en texto',
    loading: 'Cargando el grafo…',
    failed: 'No se pudo cargar el grafo. La lista de abajo tiene la misma información.',
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
    title: 'German Padua · Computer engineer and mathematician',
    description:
      'Computer engineer and mathematician. I build models and data systems that survive an audit: IFRS 9 credit risk, causal anomaly detection, and self-hosted AI platforms.',
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
    headline: 'I build models and systems that survive an audit.',
    support:
      'Double degree in Computer Engineering and Mathematics, MSc in Data Science. Today I work on IFRS 9 credit risk and, outside the bank, on causal anomaly detection and self-hosted AI platforms.',
    primaryAction: 'See the projects',
    secondaryAction: 'Experience',
    stats: [
      { value: '9.9/10', label: 'Thesis on graph neural networks on pseudo-Riemannian manifolds' },
      { value: '8.59/10', label: 'MSc in Data Science, University of Granada' },
      { value: '90/105,000', label: 'Santander AI Experience @ IE, July 2026' },
    ],
  },
  profile: {
    eyebrow: 'Profile',
    title: 'mathematics + computer science + data',
    lead: 'Three axes, and why together they are worth more than separately.',
    paragraphs: [
      'I studied Mathematics and Computer Science because I am drawn to problems you have to genuinely understand before you can solve them, not problems you solve by applying something you already know. I took both degrees at once, then an MSc in Data Science, and it left me with a useful habit: when a result looks too good, I check it again.',
      'I work on credit risk under the IFRS 9 framework, where I own the calibration, monitoring, and projection of the LGD parameter. It is an environment where a model is not worth its validation metric, but what it withstands when someone outside audits the data, the assumptions, and the documentation six months later.',
      'What interests me is not modelling in isolation: it is the whole process. Understanding the problem, designing a solution, iterating, and making the result useful. Outside the bank I build the same kind of thing for the pleasure of it: causal anomaly detection over public Formula 1 telemetry, self-hosted inference gateways with instrumented evaluation, and flows that turn voice notes into reviewable documents. If it cannot be reproduced, it is not finished.',
    ],
    pillars: [
      {
        label: 'Mathematics',
        detail:
          'Statistics, linear algebra, optimisation, and differential geometry. Formalism is not decoration: it is what tells you a model is wrong before production does.',
      },
      {
        label: 'Computer science',
        detail:
          'Systems that actually run: pipelines, containers, continuous integration, and tests. A Jupyter notebook is not a product.',
      },
      {
        label: 'Data science',
        detail:
          'From raw data to a decision, with lineage. Risk models, anomaly detection, computer vision, and LLMs in production.',
      },
    ],
  },
  sections: {
    about: { eyebrow: 'Profile', title: 'Profile', lead: '' },
    work: { eyebrow: 'Track record', title: 'Experience', lead: '' },
    projects: { eyebrow: 'Work', title: 'Projects', lead: 'Systems I designed, built, and measured.' },
    skills: { eyebrow: 'Toolbox', title: 'Skills', lead: '' },
    highlights: {
      eyebrow: 'Recognition',
      title: 'Selections and competitions',
      lead: 'Things that are neither a job nor a degree, and that still explain a fair amount.',
    },
    offClock: {
      eyebrow: 'Off the clock',
      title: 'Off the clock',
      lead: 'What I do when I am not working on this. Or when I am.',
    },
    education: { eyebrow: 'Background', title: 'Education and certifications', lead: '' },
    playground: {
      eyebrow: 'Playground',
      title: 'Playground',
      lead: 'Three ways to touch this site: a terminal, a skill graph, and a qualifying lap.',
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
    built: 'Built with Astro. The document ships no JavaScript: only the three interactive layers load it.',
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
    limits: 'What I do not claim',
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
    share: 'Run',
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
    reset: 'Re-layout',
    hint: 'Hover a node to see what it connects to, and click to read the note. You can drag them.',
    usedIn: 'Used in',
    empty: 'No area is selected.',
    canvasLabel: 'Skill graph: nodes grouped by area and joined by relationships of use, application, extension and affinity.',
    selected: 'Selected',
    listLabel: 'The same skills, in text',
    loading: 'Loading the graph…',
    failed: 'The graph could not be loaded. The list below has the same information.',
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
