import { Fragment, ReactNode } from "react";
import { LegalFooter } from "../components/LegalFooter";
import terms from "../../docs/TERMOS_DE_USO_RASCUNHO.md?raw";
import privacy from "../../docs/POLITICA_DE_PRIVACIDADE_RASCUNHO.md?raw";
import cancellation from "../../docs/POLITICA_DE_CANCELAMENTO_E_REEMBOLSO_RASCUNHO.md?raw";

type Kind = "terms" | "privacy" | "cancellation";
const documents = {
  terms: {
    title: "Termos de Uso",
    summary: "Regras para contratação e uso do OBS Stream Tools.",
    source: terms,
  },
  privacy: {
    title: "Política de Privacidade",
    summary: "Como a VEROLAB trata dados pessoais e preferências locais.",
    source: privacy,
  },
  cancellation: {
    title: "Cancelamento e Reembolso",
    summary: "Condições para cancelar a renovação e solicitar reembolso.",
    source: cancellation,
  },
};

function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, index) =>
      part.startsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : part.startsWith("`") ? (
        <code key={index}>{part.slice(1, -1)}</code>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}

function MarkdownDocument({ source }: { source: string }) {
  const lines = source.split("\n").slice(1);
  const nodes: ReactNode[] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || line === "---") continue;
    if (line.startsWith("## ")) {
      nodes.push(<h2 key={index}>{line.slice(3)}</h2>);
      continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={index}>{line.slice(4)}</h3>);
      continue;
    }
    if (line.startsWith("> ")) {
      nodes.push(
        <aside key={index} className="legal-warning">
          {inline(line.slice(2))}
        </aside>,
      );
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("- ")) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      index -= 1;
      nodes.push(
        <ul key={index}>
          {items.map((item) => (
            <li key={item}>{inline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    nodes.push(<p key={index}>{inline(line)}</p>);
  }
  return <>{nodes}</>;
}

export function LegalPage({ kind }: { kind: Kind }) {
  const document = documents[kind];
  return (
    <div className="legal-page">
      <header>
        <a href="/" className="account-brand">
          <img src="/logo.png" alt="" />
          <span>
            <strong>OBS Stream</strong>
            <small>TOOLS</small>
          </span>
        </a>
        <a href="/">Voltar ao início</a>
      </header>
      <main>
        <h1>{document.title}</h1>
        <p className="legal-summary">{document.summary}</p>
        {/* <dl className="legal-meta">
          <div>
            <dt>Última atualização</dt>
            <dd>Pendente</dd>
          </div>
          <div>
            <dt>Vigência</dt>
            <dd>Pendente</dd>
          </div>
        </dl> */}
        <article className="legal-document">
          <MarkdownDocument source={document.source} />
        </article>
      </main>
      <footer>
        <LegalFooter />
      </footer>
    </div>
  );
}
