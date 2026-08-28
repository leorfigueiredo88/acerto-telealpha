// Leitura automática do comprovante (OCR) — roda inteiramente no
// navegador via Tesseract.js, sem backend nem chave de API. Serve só
// como ponto de partida: a precisão varia bastante (foto torta, letra
// pequena, cada nota num formato diferente) — os campos preenchidos
// sempre precisam ser conferidos antes de enviar.
//
// As bibliotecas (tesseract.js + pdfjs-dist) são pesadas e só são
// baixadas sob demanda (import dinâmico), quando o usuário de fato
// anexa um arquivo — não faz sentido carregar isso pra quem nunca usa.

async function pdfParaCanvas(file) {
  const [{ getDocument, GlobalWorkerOptions }, workerUrlModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = workerUrlModule.default;

  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const pagina = await pdf.getPage(1); // só a primeira página
  const viewport = pagina.getViewport({ scale: 2 }); // escala maior = OCR mais preciso

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await pagina.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return canvas;
}

// Devolve o texto bruto reconhecido numa imagem ou PDF (primeira página).
export async function lerTextoDoArquivo(file) {
  const { createWorker } = await import("tesseract.js");
  const origem = file.type === "application/pdf" ? await pdfParaCanvas(file) : file;

  const worker = await createWorker("por");
  try {
    const { data } = await worker.recognize(origem);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

// Heurística simples pra puxar valor e nome do estabelecimento do texto
// reconhecido — não há garantia de acerto, é só uma sugestão inicial.
export function extrairCamposDoTexto(texto) {
  const linhas = texto.split("\n").map((l) => l.trim()).filter(Boolean);
  const regexValor = /\d{1,3}(?:\.\d{3})*,\d{2}/g;

  // valor: prioriza uma linha com "TOTAL" (e não "SUBTOTAL"); sem isso,
  // assume o maior valor monetário encontrado no texto inteiro.
  let valor = null;
  const linhaTotal = linhas.find((l) => /total/i.test(l) && !/subtotal/i.test(l));
  if (linhaTotal) {
    const m = linhaTotal.match(regexValor);
    if (m) valor = m[m.length - 1];
  }
  if (!valor) {
    const todos = texto.match(regexValor);
    if (todos) {
      const numero = (v) => parseFloat(v.replace(/\./g, "").replace(",", "."));
      valor = todos.reduce((maior, atual) => (numero(atual) > numero(maior) ? atual : maior));
    }
  }

  // estabelecimento: primeira linha "de nome" (mais letra que número/símbolo)
  // entre as primeiras do documento — no topo de recibos costuma vir o nome.
  const estabelecimento = linhas.slice(0, 6).find((l) => {
    if (l.length < 3 || l.length > 60) return false;
    const letras = (l.match(/[A-Za-zÀ-ÿ]/g) || []).length;
    return letras / l.length > 0.5;
  });

  return { valor: valor || null, estabelecimento: estabelecimento || null };
}
