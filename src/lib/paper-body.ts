import { readFileSync } from "node:fs";
import path from "node:path";
import type { FigureId } from "@/lib/research";

/**
 * The paper reader's parser.
 *
 * The papers live in this repo as markdown, copied from the camera-ready
 * (`docs/paper/CAMERA.md` in the research repo) so that a number on the page
 * and a number in the paper cannot drift. This module turns that markdown
 * into a typed block list at build time; nothing here runs in the browser.
 *
 * The subset is deliberately small, because the papers use a small subset:
 * headings, paragraphs, one blockquote, tables, horizontal rules, and a
 * `::figure <id>::` line marking where a figure is argued. Anything outside
 * the subset renders as plain text rather than silently disappearing.
 */

export type Inline = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

export type Block =
  | { kind: "p"; spans: Inline[]; note?: boolean }
  | { kind: "quote"; spans: Inline[] }
  | { kind: "h3"; id: string; number: string | null; title: string }
  | { kind: "table"; head: Inline[][]; rows: Inline[][][] }
  | { kind: "figure"; figure: FigureId }
  | { kind: "hr" };

export type PaperSection = {
  id: string;
  number: string | null;
  title: string;
  blocks: Block[];
  subsections: { id: string; number: string | null; title: string }[];
};

const HEADING_NUMBER = /^(\d+(?:\.\d+)*)\s+(.*)$/;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/** `4.1 Every candidate fails` becomes `s4-1`, `Abstract` becomes `abstract`. */
function headingId(raw: string): { id: string; number: string | null; title: string } {
  const match = HEADING_NUMBER.exec(raw);
  if (match) {
    return {
      id: `s${match[1].replace(/\./g, "-")}`,
      number: match[1],
      title: match[2],
    };
  }
  return { id: slugify(raw), number: null, title: raw };
}

/** Bold, italic and code, in the one nesting order the papers actually use. */
export function parseInline(source: string): Inline[] {
  const spans: Inline[] = [];
  let buffer = "";
  let bold = false;
  let italic = false;
  let index = 0;

  const flush = () => {
    if (!buffer) return;
    spans.push({
      text: buffer,
      ...(bold ? { bold: true } : {}),
      ...(italic ? { italic: true } : {}),
    });
    buffer = "";
  };

  while (index < source.length) {
    const rest = source.slice(index);

    if (rest.startsWith("`")) {
      const end = rest.indexOf("`", 1);
      if (end > 0) {
        flush();
        spans.push({ text: rest.slice(1, end), code: true });
        index += end + 1;
        continue;
      }
    }

    if (rest.startsWith("**")) {
      flush();
      bold = !bold;
      index += 2;
      continue;
    }

    if (rest.startsWith("*")) {
      flush();
      italic = !italic;
      index += 1;
      continue;
    }

    buffer += source[index];
    index += 1;
  }

  flush();
  return spans.filter((span) => span.text.length > 0);
}

function parseRow(line: string): Inline[][] {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => parseInline(cell.trim()));
}

function isSeparator(line: string): boolean {
  return /^\|[\s:|-]+\|$/.test(line.trim());
}

function paragraph(lines: string[]): Block {
  const text = lines.join(" ").replace(/\s+/g, " ").trim();
  // A paragraph wrapped entirely in single asterisks is a source note in these
  // papers, never emphasis for its own sake, so it renders as one.
  const note = /^\*[^*].*[^*]\*$/.test(text);
  return { kind: "p", spans: parseInline(text), note: note || undefined };
}

export function parsePaper(fileName: string): PaperSection[] {
  const file = path.join(process.cwd(), "src/content/papers", fileName);
  const lines = readFileSync(file, "utf8").split("\n");

  const sections: PaperSection[] = [];
  let current: PaperSection | null = null;
  let buffer: string[] = [];
  let quote: string[] = [];
  let table: string[] = [];

  const flushParagraph = () => {
    if (buffer.length) {
      current?.blocks.push(paragraph(buffer));
      buffer = [];
    }
  };

  const flushQuote = () => {
    if (quote.length) {
      current?.blocks.push({
        kind: "quote",
        spans: parseInline(quote.join(" ").replace(/\s+/g, " ").trim()),
      });
      quote = [];
    }
  };

  const flushTable = () => {
    if (!table.length) return;
    const [headLine, ...bodyLines] = table.filter((line) => !isSeparator(line));
    current?.blocks.push({
      kind: "table",
      head: parseRow(headLine),
      rows: bodyLines.map(parseRow),
    });
    table = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushQuote();
    flushTable();
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.startsWith("## ")) {
      flushAll();
      const heading = headingId(line.slice(3).trim());
      current = { ...heading, blocks: [], subsections: [] };
      sections.push(current);
      continue;
    }

    if (line.startsWith("### ")) {
      flushAll();
      const heading = headingId(line.slice(4).trim());
      current?.blocks.push({ kind: "h3", ...heading });
      current?.subsections.push(heading);
      continue;
    }

    if (line.startsWith("::figure ")) {
      flushAll();
      const figure = line.replace("::figure ", "").replace(/::$/, "").trim();
      current?.blocks.push({ kind: "figure", figure: figure as FigureId });
      continue;
    }

    if (line.startsWith("|")) {
      flushParagraph();
      flushQuote();
      table.push(line);
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushTable();
      quote.push(line.slice(2));
      continue;
    }

    if (line.trim() === "---") {
      flushAll();
      continue;
    }

    if (line.trim() === "") {
      flushAll();
      continue;
    }

    flushQuote();
    flushTable();
    buffer.push(line.trim());
  }

  flushAll();
  return sections;
}

export function sectionById(
  sections: PaperSection[],
  id: string,
): PaperSection | undefined {
  return sections.find((section) => section.id === id);
}

export function inlineToText(spans: Inline[]): string {
  return spans.map((span) => span.text).join("");
}
