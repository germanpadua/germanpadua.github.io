/**
 * Terminal command model.
 *
 * Pure: takes a command line and a snapshot of the site's content, returns lines
 * and at most one side effect. No DOM, no state, which is what makes the easter
 * eggs and the navigation commands testable without a browser.
 *
 * Copy lives here rather than in `src/i18n/ui.ts` on purpose. Anything passed to an
 * island as a prop is serialised into the HTML of every page that hosts it, so sixty
 * strings would add kilobytes to the document to save a few hundred bytes in a
 * cacheable chunk. Island copy belongs in the island bundle.
 */

export type Tone = 'default' | 'dim' | 'ok' | 'warn' | 'err' | 'accent' | 'heading';

export interface Line {
  text: string;
  tone?: Tone;
  href?: string;
}

export type Action =
  | { kind: 'clear' }
  | { kind: 'theme'; value: string }
  | { kind: 'navigate'; href: string }
  | { kind: 'scroll'; selector: string };

export interface ProjectFacts {
  slug: string;
  title: string;
  summary: string;
  year: number;
  status: string;
  visibility: string;
  stack: string[];
  metrics: { value: string; label: string; basis: string }[];
  repo?: string;
  demo?: string;
  team?: string;
  path: string;
}

export interface TerminalContent {
  identity: {
    name: string;
    email: string;
    github: string;
    linkedin: string;
    location: string;
  };
  projects: ProjectFacts[];
  experience: { title: string; organisation: string; period: string; summary: string }[];
  education: { title: string; institution: string; period: string; grade?: string }[];
  highlights: { title: string; issuer: string; period: string; headline?: string }[];
  interests: { group: string; items: string[] }[];
  skills: { id: string; label: string; area: string; weight: number; note: string }[];
  areas: { id: string; label: string }[];
  paths: { projects: string; skills: string; work: string; education: string; contact: string; playground: string; map: string };
  themes: string[];
  otherLocale: { code: string; href: string };
  skillCount: number;
  edgeCount: number;
}

export interface CommandContext {
  locale: 'es' | 'en';
  content: TerminalContent;
}

export interface CommandResult {
  lines: Line[];
  action?: Action;
}

export interface Command {
  name: string;
  aliases?: string[];
  /** One line for `help`. */
  summary: Record<'es' | 'en', string>;
  run: (args: string[], ctx: CommandContext) => CommandResult;
}

/** Shown on the first paint and by `help`. */
export const SUGGESTIONS = ['help', 'whoami', 'projects', 'skills', 'experience', 'theme', 'neofetch'];

const t = (locale: 'es' | 'en', es: string, en: string) => (locale === 'es' ? es : en);

export const BANNER: Record<'es' | 'en', string[]> = {
  es: [
    'Terminal del portfolio de Germán Padua.',
    "Escribe `help` para ver los comandos, o usa el tabulador para completar.",
  ],
  en: [
    "Germán Padua's portfolio terminal.",
    'Type `help` for the command list, or press tab to complete.',
  ],
};

export const COMMANDS: Command[] = [
  {
    name: 'help',
    summary: { es: 'lista los comandos disponibles', en: 'list the available commands' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const wanted = args[0];
      if (wanted) {
        const found = COMMANDS.find((c) => c.name === wanted || c.aliases?.includes(wanted));
        if (!found) {
          return { lines: [{ text: t(locale, `No conozco \`${wanted}\`.`, `I don't know \`${wanted}\`.`), tone: 'err' }] };
        }
        return {
          lines: [
            { text: found.name, tone: 'heading' },
            { text: found.summary[locale] },
            ...(found.aliases?.length ? [{ text: t(locale, `alias: ${found.aliases.join(', ')}`, `aliases: ${found.aliases.join(', ')}`), tone: 'dim' as Tone }] : []),
          ],
        };
      }
      const width = Math.max(...COMMANDS.map((c) => c.name.length));
      return {
        lines: [
          { text: t(locale, 'Comandos', 'Commands'), tone: 'heading' },
          ...COMMANDS.map((command) => ({
            text: `${command.name.padEnd(width + 2)}${command.summary[locale]}`,
          })),
          { text: '', tone: 'dim' },
          {
            text: t(
              locale,
              '↑ y ↓ recorren el historial. Tab completa. Hay algún que otro huevo de pascua.',
              '↑ and ↓ walk the history. Tab completes. There are one or two easter eggs.',
            ),
            tone: 'dim',
          },
        ],
      };
    },
  },
  {
    name: 'whoami',
    summary: { es: 'quién es esta persona', en: 'who this person is' },
    run: (_args, ctx) => {
      const { identity } = ctx.content;
      const locale = ctx.locale;
      return {
        lines: [
          { text: identity.name, tone: 'heading' },
          {
            text: t(
              locale,
              'Ingeniero informático y matemático. Científico de datos en riesgo de crédito bajo IFRS 9.',
              'Computer engineer and mathematician. Data scientist in credit risk under IFRS 9.',
            ),
          },
          {
            text: t(
              locale,
              'Conecto matemáticas, aprendizaje automático y desarrollo de productos.',
              'I connect mathematics, machine learning and product development.',
            ),
            tone: 'accent',
          },
          { text: identity.location, tone: 'dim' },
        ],
      };
    },
  },
  {
    name: 'about',
    aliases: ['perfil'],
    summary: { es: 'el perfil completo, en la página', en: 'the full profile, on the page' },
    run: (_args, ctx) => ({
      lines: [
        {
          text: t(ctx.locale, 'Te llevo a la sección de perfil.', 'Taking you to the profile section.'),
          tone: 'ok',
        },
      ],
      action: { kind: 'scroll', selector: '#about' },
    }),
  },
  {
    name: 'projects',
    aliases: ['proyectos', 'ls'],
    summary: { es: 'lista los proyectos, o filtra por año', en: 'list the projects, or filter by year' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const filter = args[0];
      let list = ctx.content.projects;
      if (filter && /^\d{4}$/.test(filter)) {
        list = list.filter((project) => String(project.year) === filter);
      } else if (filter) {
        const needle = filter.toLowerCase();
        list = list.filter(
          (project) =>
            project.title.toLowerCase().includes(needle) ||
            project.stack.some((item) => item.toLowerCase().includes(needle)),
        );
      }
      if (list.length === 0) {
        return {
          lines: [
            {
              text: t(locale, `Ningún proyecto coincide con \`${filter}\`.`, `No project matches \`${filter}\`.`),
              tone: 'warn',
            },
          ],
        };
      }
      return {
        lines: [
          {
            text: t(locale, `${list.length} proyectos. \`project <slug>\` para el detalle.`, `${list.length} projects. \`project <slug>\` for the detail.`),
            tone: 'heading',
          },
          ...list.map((project) => ({
            text: `${project.slug.padEnd(26)}${project.year}  ${project.title}`,
            href: project.path,
          })),
        ],
      };
    },
  },
  {
    name: 'project',
    aliases: ['proyecto', 'cat'],
    summary: { es: 'detalle de un proyecto por su slug', en: 'one project by slug' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const slug = args[0];
      if (!slug) {
        return { lines: [{ text: t(locale, 'Uso: `project <slug>`.', 'Usage: `project <slug>`.'), tone: 'warn' }] };
      }
      const project = ctx.content.projects.find((entry) => entry.slug === slug);
      if (!project) {
        return {
          lines: [
            { text: t(locale, `No hay ningún proyecto llamado \`${slug}\`.`, `No project called \`${slug}\`.`), tone: 'err' },
            { text: t(locale, 'Probá `projects`.', 'Try `projects`.'), tone: 'dim' },
          ],
        };
      }
      const lines: Line[] = [
        { text: project.title, tone: 'heading' },
        { text: project.summary },
        { text: '', tone: 'dim' },
        { text: `${project.year}  ·  ${project.status}  ·  ${project.visibility}`, tone: 'dim' },
        { text: project.stack.join(' · '), tone: 'dim' },
      ];
      if (project.team) {
        lines.push({ text: t(locale, `Equipo: ${project.team}`, `Team: ${project.team}`), tone: 'accent' });
      }
      if (project.metrics.length > 0) {
        lines.push({ text: '', tone: 'dim' }, { text: t(locale, 'Números', 'Numbers'), tone: 'heading' });
        for (const metric of project.metrics) {
          // The provenance marker is part of the terminal output too: a figure that
          // is a goal must not read like a result just because it is in a terminal.
          const marker = metric.basis === 'target' ? ' (objetivo)' : metric.basis === 'unverified' ? ' (sin verificar)' : '';
          lines.push({ text: `${metric.value.padEnd(14)}${metric.label}${marker}` });
        }
      }
      if (project.repo) lines.push({ text: project.repo, href: project.repo, tone: 'accent' });
      if (project.demo) lines.push({ text: project.demo, href: project.demo, tone: 'accent' });
      lines.push({ text: t(locale, 'Abrilo completo:', 'Open it in full:'), href: project.path, tone: 'ok' });
      return { lines };
    },
  },
  {
    name: 'skills',
    aliases: ['habilidades'],
    summary: { es: 'skills, opcionalmente por área', en: 'skills, optionally by area' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const wanted = args[0]?.toLowerCase();
      const areas = wanted
        ? ctx.content.areas.filter((area) => area.id === wanted || area.label.toLowerCase().startsWith(wanted))
        : ctx.content.areas;
      if (areas.length === 0) {
        return {
          lines: [
            {
              text: t(locale, `Áreas: ${ctx.content.areas.map((a) => a.id).join(', ')}`, `Areas: ${ctx.content.areas.map((a) => a.id).join(', ')}`),
              tone: 'warn',
            },
          ],
        };
      }
      const lines: Line[] = [
        {
          text: `${ctx.content.skillCount} skills, ${ctx.content.edgeCount} relaciones.`,
          tone: 'heading',
        },
      ];
      for (const area of areas) {
        const nodes = ctx.content.skills
          .filter((node) => node.area === area.id)
          .sort((a, b) => b.weight - a.weight);
        lines.push({ text: '', tone: 'dim' }, { text: area.label.toUpperCase(), tone: 'accent' });
        lines.push({ text: nodes.map((node) => node.label).join('  ·  ') });
      }
      lines.push(
        { text: '', tone: 'dim' },
        { text: t(locale, 'El mapa interactivo está en su propia página: escribe `graph`.', 'The interactive map has its own page: type `graph`.'), tone: 'dim' },
      );
      return { lines, action: { kind: 'scroll', selector: '#skills' } };
    },
  },
  {
    name: 'experience',
    aliases: ['experiencia', 'work'],
    summary: { es: 'trayectoria profesional', en: 'professional track record' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Experiencia', 'Experience'), tone: 'heading' },
        ...ctx.content.experience.flatMap((role) => [
          { text: role.title, tone: 'accent' as Tone },
          { text: `${role.organisation} · ${role.period}`, tone: 'dim' as Tone },
          { text: role.summary },
          { text: '', tone: 'dim' as Tone },
        ]),
      ],
    }),
  },
  {
    name: 'education',
    aliases: ['formacion', 'formación'],
    summary: { es: 'formación y certificaciones', en: 'education and certifications' },
    run: (_args, ctx) => {
      const locale = ctx.locale;
      return {
        lines: [
          { text: t(locale, 'Formación', 'Education'), tone: 'heading' },
          ...ctx.content.education.map((entry) => ({
            text: `${entry.period.padEnd(30)}${entry.title}${entry.grade ? ` — ${entry.grade}` : ''}`,
          })),
        ],
        action: { kind: 'scroll', selector: '#education' },
      };
    },
  },
  {
    name: 'highlights',
    aliases: ['reconocimientos'],
    summary: { es: 'selecciones y competiciones', en: 'selections and competitions' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Reconocimientos', 'Recognition'), tone: 'heading' },
        ...ctx.content.highlights.map((entry) => ({
          text: `${entry.period.padEnd(24)}${entry.title}${entry.headline ? ` — ${entry.headline}` : ''}`,
        })),
      ],
      action: { kind: 'scroll', selector: '#highlights' },
    }),
  },
  {
    name: 'interests',
    aliases: ['fuera', 'off-clock'],
    summary: { es: 'lo que hago fuera del trabajo', en: 'what I do off the clock' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Fuera del reloj', 'Off the clock'), tone: 'heading' },
        ...ctx.content.interests.flatMap((group) => [
          { text: group.group, tone: 'accent' as Tone },
          { text: group.items.join('  ·  ') },
        ]),
      ],
      action: { kind: 'scroll', selector: '#off-clock' },
    }),
  },
  {
    name: 'contact',
    aliases: ['contacto'],
    summary: { es: 'cómo escribirme', en: 'how to reach me' },
    run: (_args, ctx) => {
      const { identity } = ctx.content;
      return {
        lines: [
          { text: t(ctx.locale, 'Contacto', 'Contact'), tone: 'heading' },
          { text: identity.email, href: `mailto:${identity.email}`, tone: 'accent' },
          { text: identity.linkedin, href: identity.linkedin, tone: 'accent' },
          { text: identity.github, href: identity.github, tone: 'accent' },
        ],
        action: { kind: 'scroll', selector: '#contact' },
      };
    },
  },
  {
    name: 'theme',
    aliases: ['tema'],
    summary: { es: 'cambia el tema visual', en: 'change the visual theme' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const wanted = args[0]?.toLowerCase();
      const themes = ctx.content.themes;
      if (!wanted) {
        // Driving the real control rather than the root attribute: what the terminal
        // does has to be what the switch does, including persisting the choice.
        return {
          lines: [
            { text: t(locale, 'Temas disponibles', 'Available themes'), tone: 'heading' },
            { text: themes.join('  ·  ') },
            { text: t(locale, 'Uso: `theme <nombre>`.', 'Usage: `theme <name>`.'), tone: 'dim' },
          ],
        };
      }
      if (!themes.includes(wanted)) {
        return {
          lines: [{ text: t(locale, `No existe el tema \`${wanted}\`.`, `There is no theme \`${wanted}\`.`), tone: 'err' }],
        };
      }
      return {
        lines: [{ text: t(locale, `Tema cambiado a ${wanted}.`, `Theme switched to ${wanted}.`), tone: 'ok' }],
        action: { kind: 'theme', value: wanted },
      };
    },
  },
  {
    name: 'lang',
    aliases: ['idioma', 'language'],
    summary: { es: 'cambia de idioma', en: 'switch language' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const wanted = args[0]?.toLowerCase();
      const other = ctx.content.otherLocale;
      if (!wanted) {
        return {
          lines: [
            {
              text: t(locale, `Idioma actual: ${locale}. El otro es \`${other.code}\`.`, `Current language: ${locale}. The other one is \`${other.code}\`.`),
            },
          ],
        };
      }
      if (wanted !== other.code) {
        return {
          lines: [{ text: t(locale, `Idiomas disponibles: ${locale}, ${other.code}.`, `Available languages: ${locale}, ${other.code}.`), tone: 'warn' }],
        };
      }
      return {
        lines: [{ text: t(locale, `Cambiando a ${other.code}…`, `Switching to ${other.code}…`), tone: 'ok' }],
        action: { kind: 'navigate', href: other.href },
      };
    },
  },
  {
    name: 'goto',
    aliases: ['ir', 'cd'],
    summary: { es: 'salta a una sección', en: 'jump to a section' },
    run: (args, ctx) => {
      const locale = ctx.locale;
      const sections: Record<string, string> = {
        projects: '#projects',
        proyectos: '#projects',
        skills: '#skills',
        work: '#work',
        experiencia: '#work',
        education: '#education',
        formacion: '#education',
        highlights: '#highlights',
        playground: '#playground',
        contact: '#contact',
        contacto: '#contact',
        about: '#about',
        perfil: '#about',
      };
      const wanted = args[0]?.toLowerCase();
      const target = wanted ? sections[wanted] : undefined;
      if (!target) {
        return {
          lines: [
            {
              text: t(locale, `Secciones: ${[...new Set(Object.keys(sections))].join(', ')}`, `Sections: ${[...new Set(Object.keys(sections))].join(', ')}`),
              tone: 'warn',
            },
          ],
        };
      }
      return {
        lines: [{ text: t(locale, `Yendo a ${target}.`, `Going to ${target}.`), tone: 'ok' }],
        action: { kind: 'scroll', selector: target },
      };
    },
  },
  {
    name: 'graph',
    aliases: ['grafo'],
    summary: { es: 'el mapa de conocimientos', en: 'the knowledge map' },
    run: (_args, ctx) => ({
      lines: [{ text: t(ctx.locale, 'Abriendo el mapa de conocimientos.', 'Opening the knowledge map.'), tone: 'ok' }],
      action: { kind: 'navigate', href: ctx.content.paths.map },
    }),
  },
  {
    name: 'game',
    aliases: ['juego', 'race'],
    summary: { es: 'la vuelta de clasificación', en: 'the qualifying lap' },
    run: (_args, ctx) => ({
      lines: [{ text: t(ctx.locale, 'A pista.', 'To the track.'), tone: 'ok' }],
      action: { kind: 'scroll', selector: '#playground' },
    }),
  },
  {
    name: 'clear',
    aliases: ['cls'],
    summary: { es: 'limpia la pantalla', en: 'clear the screen' },
    run: () => ({ lines: [], action: { kind: 'clear' } }),
  },
  {
    name: 'neofetch',
    summary: { es: 'la ficha técnica, en modo sistema', en: 'the spec sheet, system style' },
    run: (_args, ctx) => {
      const { content } = ctx;
      const art = [
        '   ▄▄▄▄▄▄▄   ',
        '  █  ▄▄▄  █  ',
        '  █ █   █ █  ',
        '  █ █▄▄▄█ █  ',
        '  █       █  ',
        '   ▀▀▀▀▀▀▀   ',
      ];
      const facts = [
        `german@portfolio`,
        `------------`,
        `Name      ${content.identity.name}`,
        `Role      ${t(ctx.locale, 'Científico de datos · riesgo de crédito', 'Data scientist · credit risk')}`,
        `Location  ${content.identity.location}`,
        `Projects  ${content.projects.length}`,
        `Skills    ${content.skillCount} (${content.edgeCount} edges)`,
        `Themes    ${content.themes.length}`,
        `Shell     web, no electrons were harmed`,
      ];
      const rows = Math.max(art.length, facts.length);
      const lines: Line[] = [];
      for (let i = 0; i < rows; i += 1) {
        lines.push({ text: `${(art[i] ?? '').padEnd(15)}${facts[i] ?? ''}` });
      }
      return { lines };
    },
  },
  {
    name: 'exit',
    aliases: ['quit', 'salir'],
    summary: { es: 'intenta salir', en: 'try to leave' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Buena suerte cerrando una pestaña del navegador.', 'Good luck closing a browser tab.'), tone: 'warn' },
      ],
    }),
  },

  /* ------------------------------------------------------------ easter eggs */

  {
    name: 'beskar',
    summary: { es: 'aleación resistente', en: 'a hard alloy' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Esto es el camino.', 'This is the way.'), tone: 'accent' },
        {
          text: t(
            ctx.locale,
            'Un modelo bien documentado es lo más parecido al beskar que vas a encontrar en ciencia de datos.',
            'A well documented model is the closest thing to beskar you will find in data science.',
          ),
          tone: 'dim',
        },
      ],
    }),
  },
  {
    name: 'sudo',
    summary: { es: 'permisos de root, en teoría', en: 'root access, in theory' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'german no está en el archivo sudoers. Se informará de este incidente.', 'german is not in the sudoers file. This incident will be reported.'), tone: 'err' },
        { text: t(ctx.locale, 'Al departamento de matemáticas.', 'To the mathematics department.'), tone: 'dim' },
      ],
    }),
  },
  {
    name: 'hoth',
    summary: { es: 'hace frío aquí fuera', en: "it's cold out here" },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'La temperatura exterior es de -40 grados. No hay señal de vida.', 'Outside temperature is -40 degrees. No life signs detected.'), tone: 'accent' },
        { text: t(ctx.locale, 'Aprovecha para leerte la documentación de la API.', 'Good moment to read the API documentation.'), tone: 'dim' },
      ],
    }),
  },
  {
    name: 'brand',
    aliases: ['sanderson'],
    summary: { es: 'juramentos y calendarios', en: 'oaths and calendars' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'La vida antes que la muerte. La fuerza antes que la debilidad.', 'Life before death. Strength before weakness.'), tone: 'accent' },
        { text: t(ctx.locale, 'El viaje antes que el destino.', 'Journey before destination.'), tone: 'accent' },
        { text: t(ctx.locale, 'También vale para publicar métricas con su artefacto de procedencia.', 'Also applies to publishing metrics with their provenance artifact.'), tone: 'dim' },
      ],
    }),
  },
  {
    name: 'brand-of-sacrifice',
    aliases: ['berserk'],
    summary: { es: 'lucha, sacrificio y mucho negro', en: 'struggle, sacrifice, a lot of black' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Con esfuerzo, disciplina y mucho café: nada más.', 'With struggle, discipline and a lot of coffee: nothing else.'), tone: 'accent' },
        { text: t(ctx.locale, 'Tema recomendado: `theme tinta`.', 'Recommended theme: `theme tinta`.'), tone: 'dim' },
      ],
    }),
  },
  {
    name: 'kermit',
    summary: { es: 'no era fácil ser verde', en: 'it was not easy being green' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'KermitPanic, HackSpain 2026, track Prosper AI. Cuatro en el marcador en vivo.', 'KermitPanic, HackSpain 2026, Prosper AI track. Fourth on the live scoreboard.'), tone: 'accent' },
        { text: t(ctx.locale, 'Probá `theme phosphor` para verlo como una consola de verdad.', 'Try `theme phosphor` to see it as a proper console.'), tone: 'dim' },
      ],
    }),
  },
  {
    name: 'f1',
    aliases: ['boxbox'],
    summary: { es: 'box, box', en: 'box, box' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Box, box. Box opuesto confirmado.', 'Box, box. Box opposite confirmed.'), tone: 'accent' },
        { text: t(ctx.locale, 'Tenemos un proyecto entero sobre esto: probá `project telemetry-sentinel`.', 'We have a whole project about this: try `project telemetry-sentinel`.'), tone: 'dim' },
      ],
    }),
  },
  {
    name: 'truth',
    aliases: ['metrics'],
    summary: { es: 'sobre los números', en: 'about the numbers' },
    run: (_args, ctx) => ({
      lines: [
        { text: t(ctx.locale, 'Un número que no puedo señalar no entra en este portfolio.', 'A number I cannot point at does not go on this site.'), tone: 'accent' },
        {
          text: t(
            ctx.locale,
            'Por eso verás métricas marcadas como objetivo o sin verificar. Un objetivo presentado como resultado es la forma más rápida de perder una entrevista.',
            'That is why you will see metrics marked as a goal or unverified. A goal presented as a result is the fastest way to lose an interview.',
          ),
          tone: 'dim',
        },
      ],
    }),
  },
];

/** Command names and aliases, for tab completion. */
export const COMPLETIONS: string[] = COMMANDS.flatMap((command) => [command.name, ...(command.aliases ?? [])]).sort();

export function resolve(input: string, ctx: CommandContext): CommandResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) return { lines: [] };

  const [name, ...args] = trimmed.split(/\s+/);
  const command = COMMANDS.find((entry) => entry.name === name || entry.aliases?.includes(name ?? ''));
  if (!command) {
    return {
      lines: [
        {
          text: t(ctx.locale, `\`${name}\` no existe. Probá \`help\`.`, `\`${name}\` does not exist. Try \`help\`.`),
          tone: 'err',
        },
      ],
    };
  }
  return command.run(args, ctx);
}

/** Longest shared prefix of the candidates, for tab completion. */
export function longestPrefix(values: string[]): string {
  if (values.length === 0) return '';
  const first = values[0] ?? '';
  let prefix = first;
  for (const value of values) {
    while (!value.startsWith(prefix)) {
      prefix = prefix.slice(0, -1);
      if (prefix.length === 0) return '';
    }
  }
  return prefix;
}
