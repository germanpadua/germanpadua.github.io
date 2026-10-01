#!/usr/bin/env python3
"""
One-off extractor for the content of the previous site.

The old site was Jekyll: its text lived in `_data/*.yml` and was rendered into modals and
timelines. The YAML is already archived byte-for-byte under `backup/legacy/_data/`; this
script produces the human-readable half, so the descriptions can be compared against the
new ones and copied without reading markup.

Not part of the build. Kept in the repository as the record of how the backup was made.
"""
import html as html_module
import pathlib
import re
import sys

SOURCES = {
    'es': '/tmp/live-es.html',
    'en': '/tmp/live-en.html',
}


def strip_tags(fragment: str) -> str:
    text = re.sub(r'<br\s*/?>', '\n', fragment)
    text = re.sub(r'</(p|li|div|h\d)>', '\n', text)
    text = re.sub(r'<li[^>]*>', '- ', text)
    text = re.sub(r'<[^>]+>', '', text)
    text = html_module.unescape(text)
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)


def slice_between(text: str, start_marker: str, end_marker: str) -> str:
    start = text.find(start_marker)
    if start == -1:
        return ''
    end = text.find(end_marker, start + len(start_marker))
    return text[start:end if end != -1 else len(text)]


def extract_timeline(section: str) -> list[dict[str, str]]:
    entries = []
    for block in re.split(r'<div class="timeline-item', section)[1:]:
        date = re.search(r'<span class="timeline-date">(.*?)</span>', block, re.S)
        title = re.search(r'<h3[^>]*>(.*?)</h3>', block, re.S)
        org = re.search(r'<p class="timeline-org">(.*?)</p>', block, re.S)
        desc = re.search(r'<div class="timeline-desc">(.*?)</div>\s*</div>', block, re.S)
        entries.append({
            'date': strip_tags(date.group(1)) if date else '',
            'title': strip_tags(title.group(1)) if title else '',
            'org': strip_tags(org.group(1)) if org else '',
            'body': strip_tags(desc.group(1)) if desc else '',
        })
    return entries


def extract_projects(section: str, page: str) -> list[dict[str, str]]:
    projects = []
    cards = re.split(r'<article class="box style2">', section)[1:]
    for index, card in enumerate(cards, start=1):
        title = re.search(r'<h3><a[^>]*>(.*?)</a>', card, re.S)
        summary = re.search(r'</h3>\s*<p>(.*?)</p>', card, re.S)
        tags = re.findall(r'<span class="project-card-tag">(.*?)</span>', card, re.S)
        # The full text lives in `div.project-description` inside the modal. Taking the
        # whole modal drags in the carousel, its Previous/Next controls and the next
        # project's header, which is noise in a document meant for reading.
        modal = re.search(rf'id="project-{index}-modal"(.*?)(?=id="project-{index + 1}-modal"|$)', page, re.S)
        description = re.search(r'<div class="project-description[^"]*">(.*?)</div>', modal.group(1) if modal else '', re.S)
        projects.append({
            'title': strip_tags(title.group(1)) if title else f'project-{index}',
            'summary': strip_tags(summary.group(1)) if summary else '',
            'tags': [strip_tags(tag) for tag in tags],
            'body': strip_tags(description.group(1)) if description else '',
        })
    return projects


def main() -> int:
    out = [
        '# Content of the previous site, archived before the rewrite',
        '',
        'This is the text the old Jekyll site published at <https://germanpadua.github.io/>,',
        'kept because the new descriptions are not necessarily better and the originals are',
        'hard to recover once the branch is merged: the rendered HTML disappears with the',
        'next deployment, even though the YAML stays in the history.',
        '',
        'Two halves:',
        '',
        '- `backup/legacy/_data/` — the original YAML, byte for byte, as Jekyll read it.',
        '- This file — the same content as a visitor read it, rendered.',
        '',
        'The YAML is the source of truth for the exact formatting; this file is for reading.',
        '',
        '---',
        '',
    ]

    for locale, path in SOURCES.items():
        page = pathlib.Path(path).read_text(encoding='utf-8')
        heading = 'Español' if locale == 'es' else 'English'
        out.append(f'# {heading} (`{"index.html" if locale == "es" else "index-en.html"}`)')
        out.append('')

        experience = extract_timeline(slice_between(page, 'id="experience"', 'id="work"'))
        out.append('## Experience')
        out.append('')
        for entry in experience:
            out.append(f'### {entry["title"]}')
            out.append('')
            out.append(f'**{entry["org"]}** · {entry["date"]}')
            out.append('')
            out.append(entry['body'])
            out.append('')

        education = extract_timeline(slice_between(page, 'id="work"', 'id="portfolio"'))
        out.append('## Education and certifications')
        out.append('')
        for entry in education:
            out.append(f'### {entry["title"]}')
            out.append('')
            out.append(f'**{entry["org"]}** · {entry["date"]}')
            out.append('')
            out.append(entry['body'])
            out.append('')

        projects = extract_projects(slice_between(page, 'id="portfolio"', 'id="skills"'), page)
        out.append('## Projects')
        out.append('')
        for project in projects:
            out.append(f'### {project["title"]}')
            out.append('')
            if project['tags']:
                out.append(f'*{", ".join(project["tags"])}*')
                out.append('')
            out.append(f'**Card summary:** {project["summary"]}')
            out.append('')
            out.append('**Full description, as shown in the modal:**')
            out.append('')
            out.append(project['body'])
            out.append('')

        out.append('---')
        out.append('')

    destination = pathlib.Path('backup/legacy/rendered-live-site.md')
    destination.write_text('\n'.join(out).strip() + '\n', encoding='utf-8')
    print(f'wrote {destination} ({destination.stat().st_size} bytes, {len(out)} lines)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
