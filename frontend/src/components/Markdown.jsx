import { useMemo } from "react";

const INLINE_PATTERN =
  "(\\[\\s*S(\\d+)\\s*\\])|(\\b(?:Section|Sec\\.)\\s+\\d+[A-Z]?(?:\\(\\d+\\))?)|(\\*\\*[^*]+\\*\\*)|(\\*[^*\\n]+\\*)|(_[^_\\n]+_)|(`[^`]+`)|(\\[([^\\]]+)\\]\\(([^)]+)\\))";

function renderInline(text, keyBase = "", depth = 0) {
  if (!text || depth > 5) return [text];
  const nodes = [];
  let last = 0;
  let m;
  let i = 0;
  
  // Create an isolated regex instance per stack frame to prevent lastIndex recursion collisions
  const regex = new RegExp(INLINE_PATTERN, "gi");

  while ((m = regex.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyBase}-${i}`;

    if (m[1]) {
      // Citation badge [S1], [S2]
      nodes.push(
        <span key={key} className="citation-chip" title={`Retrieved Source S${m[2]}`}>
          S{m[2]}
        </span>
      );
    } else if (m[3]) {
      // Legal section reference highlight e.g. Section 4
      nodes.push(
        <span key={key} className="legal-tag">
          {m[3]}
        </span>
      );
    } else if (m[4]) {
      // **bold**
      nodes.push(<strong key={key}>{renderInline(m[4].slice(2, -2), key, depth + 1)}</strong>);
    } else if (m[5] || m[6]) {
      // *italic* or _italic_
      const inner = (m[5] || m[6]).slice(1, -1);
      nodes.push(<em key={key}>{renderInline(inner, key, depth + 1)}</em>);
    } else if (m[7]) {
      // `code`
      nodes.push(<code key={key}>{m[7].slice(1, -1)}</code>);
    } else if (m[8]) {
      // [link](url)
      nodes.push(
        <a key={key} href={m[10] || "#"} target="_blank" rel="noreferrer noopener">
          {m[9]}
        </a>
      );
    }

    last = m.index + m[0].length;
    i += 1;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === "") {
      i += 1;
      continue;
    }
    if (trimmed.startsWith("```")) {
      const code = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", content: code.join("\n") });
      continue;
    }
    if (/^#{1,6}\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)[0].length;
      blocks.push({ type: "heading", level, content: renderInline(trimmed.replace(/^#+\s*/, ""), `h${i}`) });
      i += 1;
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      const quote = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      blocks.push({ type: "quote", content: renderInline(quote.join(" "), `q${i}`) });
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^[-*+]\s+/.test(t)) items.push(renderInline(t.replace(/^[-*+]\s+/, ""), `li${i}`));
        else break;
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^\d+[.)]\s+/.test(t)) items.push(renderInline(t.replace(/^\d+[.)]\s+/, ""), `li${i}`));
        else break;
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    if (/^-{3,}$/.test(trimmed)) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }
    const para = [line.trim()];
    i += 1;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (
        next === "" ||
        /^(#{1,6}\s|[-*+]\s|>\s?|\d+[.)]\s|```|-{3,}$)/.test(next)
      )
        break;
      para.push(next);
      i += 1;
    }
    blocks.push({ type: "p", content: renderInline(para.join(" "), `p${i}`) });
  }
  return blocks;
}

function renderBlock(block, index) {
  switch (block.type) {
    case "heading":
      const Tag = `h${Math.min(block.level, 6)}`;
      return <Tag key={index}>{block.content}</Tag>;
    case "p":
      return <p key={index}>{block.content}</p>;
    case "ul":
      return (
        <ul key={index}>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={index}>
          {block.items.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ol>
      );
    case "quote":
      return <blockquote key={index}>{block.content}</blockquote>;
    case "code":
      return (
        <pre key={index}>
          <code>{block.content}</code>
        </pre>
      );
    case "hr":
      return <hr key={index} />;
    default:
      return null;
  }
}

export default function Markdown({ text }) {
  const blocks = useMemo(() => parseBlocks(String(text || "").trim()), [text]);
  return <div className="md">{blocks.map(renderBlock)}</div>;
}