import type { LegalBlock, LegalDocument } from "./legalTypes";

/**
 * 약관·방침을 화면에 그린다.
 *
 * 두 문서가 같은 뼈대를 쓰므로 그리는 곳도 하나다. 조항 번호는 손으로 적지 않고
 * `<ol>` 이 매기게 둔다 — 가운데 한 항을 지웠을 때 뒤 번호가 어긋나지 않도록.
 */
export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-xl font-bold">{document.title}</h1>
        <p className="mt-2 text-xs text-content-dim">시행일 {document.effectiveFrom}</p>
      </header>

      {document.intro && (
        <div className="mb-8 flex flex-col gap-3 text-sm leading-relaxed text-content-muted">
          {document.intro.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {document.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-[15px] font-bold">{section.heading}</h2>
            {section.blocks.map((block, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 블록은 순서가 곧 정체성이다
              <Block key={index} block={block} />
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (block.kind === "text") {
    return (
      <div className="flex flex-col gap-3 text-sm leading-relaxed text-content-muted">
        {block.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    );
  }

  if (block.kind === "clauses") {
    return (
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-content-muted marker:text-content-dim">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    );
  }

  if (block.kind === "bullets") {
    return (
      <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-content-muted marker:text-content-dim">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  // 표는 좁은 화면에서 눌리는 대신 가로로 넘긴다. 눌린 표는 읽을 수 없다.
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border">
            {block.head.map((cell) => (
              <th key={cell} className="px-3 py-2.5 font-semibold text-content">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join("|")} className="border-b border-border align-top">
              {row.map((cell) => (
                <td key={cell} className="px-3 py-2.5 leading-relaxed text-content-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
