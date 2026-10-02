/**
 * Terminal island.
 *
 * A real REPL over the site's own content: history, tab completion, executable
 * commands, and the same theme switch the navbar uses. It reads nothing from the
 * desktop, it is not a fake shell, and the commands that change something do it
 * through the real controls so the terminal cannot drift from the site.
 *
 * Copy lives in the bundled command module rather than in island props: props are
 * serialised into the HTML of every hosting page, so sixty strings would cost more
 * in the document than they save in a cacheable chunk.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import {
  BANNER,
  COMMANDS,
  COMPLETIONS,
  longestPrefix,
  resolve,
  SUGGESTIONS,
  type CommandContext,
  type Line,
  type TerminalContent,
} from './terminal/commands';

interface Props {
  locale: 'es' | 'en';
  dataUrl: string;
  labels: {
    title: string;
    description: string;
    inputLabel: string;
    cleared: string;
    loading: string;
    failed: string;
  };
}

const HOST = 'german@portfolio';

export default function Terminal({ locale, dataUrl, labels }: Props) {
  const [content, setContent] = useState<TerminalContent | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const outputRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /*
   * The content is fetched rather than passed as props: serialised as island props it
   * added 43 KB of attributes to the home page, paid by every reader including the
   * ones who never touch the terminal.
   */
  useEffect(() => {
    let active = true;
    fetch(dataUrl)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((payload: TerminalContent) => {
        if (active) setContent(payload);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [dataUrl]);

  const ctx = useMemo<CommandContext | null>(
    () => (content ? { locale, content } : null),
    [content, locale],
  );

  /** The opening banner, once, on first paint. */
  useEffect(() => {
    const banner = BANNER[locale].map<Line>((text, index) => ({
      text,
      tone: index === 0 ? 'heading' : 'dim',
    }));
    setLines(banner);
    setHistory([]);
    setHistoryIndex(null);
  }, [locale]);

  // Keep the newest output in view without stealing the page scroll.
  useEffect(() => {
    const output = outputRef.current;
    if (output) output.scrollTop = output.scrollHeight;
  }, [lines]);

  const applyAction = useCallback((action: ReturnType<typeof resolve>['action']) => {
    if (!action) return;
    if (action.kind === 'clear') {
      setLines([]);
      return;
    }
    if (action.kind === 'scroll') {
      document.querySelector<HTMLDialogElement>('#terminal-mode')?.close();
      const target = document.querySelector(action.selector);
      if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      else window.location.href = `${locale === 'es' ? '/' : '/en/'}${action.selector}`;
      return;
    }
    if (action.kind === 'navigate') {
      window.location.href = action.href;
      return;
    }
    if (action.kind === 'theme') {
      /*
       * Drive the real control instead of setting `data-theme` directly: the switch
       * persists the choice, updates meta[theme-color] and keeps its own state in
       * sync. Setting the attribute here would make the terminal a second source of
       * truth that disagrees with the navbar.
       */
      const input = document.querySelector<HTMLInputElement>(
        `[data-theme-switch] input[value="${action.value}"]`,
      );
      if (input) {
        input.click();
      } else {
        document.documentElement.setAttribute('data-theme', action.value);
      }
    }
  }, [locale]);

  const run = useCallback(
    (raw: string) => {
      const command = raw.trim();
      if (command.length === 0 || !ctx) return;
      const echo: Line = { text: `${HOST} ~ $ ${command}`, tone: 'dim' };
      const result = resolve(command, ctx);
      if (result.action?.kind === 'clear') {
        setLines([]);
        setHistory((current) => [...current, command]);
        setHistoryIndex(null);
        return;
      }
      setLines((current) => [...current, echo, ...result.lines]);
      setHistory((current) => [...current, command]);
      setHistoryIndex(null);
      applyAction(result.action);
    },
    [applyAction, ctx],
  );

  const onSubmit = (event: Event) => {
    event.preventDefault();
    run(value);
    setValue('');
  };

  const complete = () => {
    const parts = value.split(/\s+/);
    // Only the first token is completed: completing slugs would need a per-command
    // argument schema, and guessing wrong is worse than not completing.
    if (parts.length > 1) {
      if (!content) return;
      const projectSlugs = content.projects.map((project) => project.slug);
      const areaIds = content.areas.map((area) => area.id);
      const themes = content.themes;
      const command = parts[0] ?? '';
      const pool =
        command === 'project' || command === 'cat'
          ? projectSlugs
          : command === 'skills'
            ? areaIds
            : command === 'theme' || command === 'tema'
              ? themes
              : [];
      const typed = parts[1] ?? '';
      const matches = pool.filter((candidate) => candidate.startsWith(typed));
      if (matches.length === 1) {
        setValue(`${command} ${matches[0]}`);
      } else if (matches.length > 1) {
        const prefix = longestPrefix(matches);
        if (prefix.length > typed.length) setValue(`${command} ${prefix}`);
        setLines((current) => [...current, { text: matches.join('  '), tone: 'dim' }]);
      }
      return;
    }

    const matches = COMPLETIONS.filter((candidate) => candidate.startsWith(value));
    if (matches.length === 1) {
      setValue(`${matches[0]} `);
    } else if (matches.length > 1) {
      const prefix = longestPrefix(matches);
      if (prefix.length > value.length) setValue(prefix);
      setLines((current) => [...current, { text: matches.join('  '), tone: 'dim' }]);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      complete();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (history.length === 0) return;
      const next = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next] ?? '');
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === null) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(null);
        setValue('');
        return;
      }
      setHistoryIndex(next);
      setValue(history[next] ?? '');
      return;
    }
    if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      setLines([]);
    }
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div class="terminal">
      <div class="terminal__chrome">
        <span class="terminal__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span class="terminal__path">{HOST}: ~/portfolio</span>
        <span class="terminal__count tabular">{[COMMANDS.length, 'cmds'].join(' ')}</span>
      </div>

      <div class="terminal__body" onClick={focusInput}>
        <div class="terminal__output" ref={outputRef} role="log" aria-live="polite" aria-label={labels.title}>
          {lines.map((line, index) =>
            line.href ? (
              <p class="terminal__line terminal__line--link" key={index}>
                <a href={line.href} rel="noopener noreferrer">
                  → {line.text}
                </a>
              </p>
            ) : (
              <p class="terminal__line" data-tone={line.tone ?? 'default'} key={index}>
                {line.text.length > 0 ? line.text : '\u00a0'}
              </p>
            ),
          )}
        </div>

        <form class="terminal__form" onSubmit={onSubmit}>
          <label class="sr-only" for="terminal-input">
            {labels.inputLabel}
          </label>
          <span class="terminal__prompt" aria-hidden="true">
            {HOST} ~ $
          </span>
          <input
            ref={inputRef}
            id="terminal-input"
            class="terminal__input"
            type="text"
            value={value}
            autocomplete="off"
            autocapitalize="off"
            spellcheck={false}
            disabled={!ctx}
            placeholder={loadFailed ? labels.failed : ctx ? '' : labels.loading}
            onInput={(event) => setValue((event.currentTarget as HTMLInputElement).value)}
            onKeyDown={onKeyDown}
          />
        </form>
      </div>

      <div class="terminal__suggestions">
        {SUGGESTIONS.map((suggestion) => (
          <button
            type="button"
            class="terminal__suggestion"
            key={suggestion}
            disabled={!ctx}
            onClick={() => {
              run(suggestion);
              focusInput();
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
