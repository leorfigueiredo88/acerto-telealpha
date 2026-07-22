# -*- coding: utf-8 -*-
"""
Gerador do Relatório de Acerto de Despesas por Viagem — Telealpha
------------------------------------------------------------------
Em produção, este script roda no backend (ex.: job Python, ou a mesma
lógica portada para uma Edge Function com pdf-lib). Ele recebe os dados
da viagem + despesas (view vw_acerto_viagem + despesas) e as imagens dos
comprovantes (bucket 'comprovantes' do Supabase Storage), e emite o PDF
final que é salvo no bucket 'relatorios' e vinculado em viagens.relatorio_url.

Uso: python gerar_relatorio_acerto.py
(neste exemplo os dados estão embutidos; em produção vêm do banco)
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
)

NAVY = HexColor("#1D2040")
BLUE = HexColor("#1B7EAD")
GRAY = HexColor("#6B7280")
LIGHT = HexColor("#F4F5F7")

def brl(v):
    s = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {s}"

def gerar_relatorio(viagem, despesas, gestor, logo_path, saida="relatorio_acerto.pdf"):
    doc = SimpleDocTemplate(
        saida, pagesize=A4,
        leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=18*mm,
        title=f"Relatório de Acerto — {viagem['nome']}", author="Telealpha",
    )
    styles = getSampleStyleSheet()
    h_title = ParagraphStyle("t", parent=styles["Title"], fontName="Helvetica-Bold",
                             fontSize=15, textColor=NAVY, alignment=2, spaceAfter=0)
    h_sec = ParagraphStyle("s", parent=styles["Heading2"], fontName="Helvetica-Bold",
                           fontSize=9.5, textColor=NAVY, spaceBefore=12, spaceAfter=4,
                           leading=12)
    lbl = ParagraphStyle("l", fontName="Helvetica-Bold", fontSize=6.5, textColor=GRAY, leading=8)
    val = ParagraphStyle("v", fontName="Helvetica", fontSize=9, textColor=NAVY, leading=11)
    small = ParagraphStyle("sm", fontName="Helvetica", fontSize=7.5, textColor=GRAY, leading=10)

    story = []

    # ---- Cabeçalho: logo + título, com régua navy ----
    logo = Image(logo_path, width=42*mm, height=42*mm * ImageReader(logo_path)._image.size[1] / ImageReader(logo_path)._image.size[0])
    cab = Table([[logo, Paragraph("Relatório de Acerto<br/>de Despesas", h_title)]],
                colWidths=[70*mm, None])
    cab.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LINEBELOW", (0, 0), (-1, -1), 2.2, NAVY),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (-1, -1), (-1, -1), 0),
    ]))
    story += [cab, Spacer(1, 6)]

    # ---- Dados da viagem ----
    participantes = ", ".join(viagem["participantes"])
    info = Table([
        [Paragraph("VIAGEM", lbl), Paragraph("DESTINO", lbl), Paragraph("PERÍODO", lbl)],
        [Paragraph(viagem["nome"], val), Paragraph(viagem["destino"], val),
         Paragraph(f"{viagem['inicio']} a {viagem['fim']}", val)],
        [Paragraph("PARTICIPANTES", lbl), Paragraph("GESTOR RESPONSÁVEL", lbl), Paragraph("FECHADO EM", lbl)],
        [Paragraph(participantes, val), Paragraph(gestor, val), Paragraph(viagem["fechada_em"], val)],
    ], colWidths=[72*mm, 55*mm, None])
    info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
        ("TOPPADDING", (0, 0), (-1, 0), 7), ("TOPPADDING", (0, 2), (-1, 2), 6),
        ("BOTTOMPADDING", (0, 1), (-1, 1), 2), ("BOTTOMPADDING", (0, 3), (-1, 3), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(info)

    # ---- Tabela de despesas ----
    story.append(Paragraph("DESPESAS DO ACERTO", h_sec))
    head = ["Data", "Colaborador", "Categoria", "Descrição", "Valor", "Status"]
    linhas = [head]
    total = 0.0
    for d in despesas:
        if d["status"] != "Recusado":
            total += d["valor"]
        linhas.append([d["data"], d["colaborador"], d["categoria"],
                       Paragraph(d["descricao"], ParagraphStyle("d", fontName="Helvetica", fontSize=8, leading=9.5)),
                       brl(d["valor"]), d["status"]])
    linhas.append(["", "", "", "TOTAL A REEMBOLSAR", brl(total), ""])

    tab = Table(linhas, colWidths=[17*mm, 30*mm, 25*mm, None, 24*mm, 20*mm], repeatRows=1)
    estilo = [
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("ALIGN", (4, 0), (4, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -2), [white, LIGHT]),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LINEABOVE", (0, -1), (-1, -1), 1.4, NAVY),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("TEXTCOLOR", (0, -1), (-1, -1), NAVY),
    ]
    # despesas recusadas em cinza
    for i, d in enumerate(despesas, start=1):
        if d["status"] == "Recusado":
            estilo.append(("TEXTCOLOR", (0, i), (-1, i), GRAY))
    tab.setStyle(TableStyle(estilo))
    story.append(tab)
    if any(d["status"] == "Recusado" for d in despesas):
        story.append(Paragraph("* Despesas recusadas constam no relatório, mas não compõem o total.", small))

    # ---- Reembolso por colaborador ----
    story.append(Paragraph("REEMBOLSO POR COLABORADOR", h_sec))
    por_colab = {}
    for d in despesas:
        if d["status"] != "Recusado":
            por_colab[d["colaborador"]] = por_colab.get(d["colaborador"], 0) + d["valor"]
    rc = Table([[Paragraph(n, val), brl(v)] for n, v in por_colab.items()],
               colWidths=[80*mm, 40*mm])
    rc.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9), ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica-Bold"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.4, HexColor("#D6D9DE")),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(rc)

    # ---- Comprovantes (imagem da nota + dados da despesa) ----
    story.append(Paragraph("COMPROVANTES ANEXADOS", h_sec))
    story.append(Paragraph(
        "Cada comprovante abaixo corresponde a uma despesa da tabela, com data, "
        "responsável, valor e situação na conciliação.", small))
    story.append(Spacer(1, 4))

    celulas, linha = [], []
    for i, d in enumerate(despesas, 1):
        img = Image(d["comprovante"], width=62*mm, height=62*mm * ImageReader(d["comprovante"])._image.size[1] / ImageReader(d["comprovante"])._image.size[0])
        legenda = Paragraph(
            f"<b>Comprovante {i:02d}</b> — {d['data']}<br/>"
            f"{d['colaborador']} · {d['categoria']}<br/>"
            f"{d['descricao']}<br/>"
            f"<b>{brl(d['valor'])}</b> · {d['status']}"
            + (f"<br/><font color='#A63A32'>Motivo: {d['motivo']}</font>" if d.get("motivo") else ""),
            ParagraphStyle("leg", fontName="Helvetica", fontSize=7.5, leading=10, textColor=NAVY))
        bloco = Table([[img], [legenda]], colWidths=[66*mm])
        bloco.setStyle(TableStyle([
            ("BOX", (0, 0), (-1, -1), 0.6, HexColor("#D6D9DE")),
            ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 5), ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        linha.append(bloco)
        if len(linha) == 2:
            par = Table([linha], colWidths=[88*mm, 88*mm])
            par.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                                     ("TOPPADDING", (0, 0), (-1, -1), 4)]))
            celulas.append(KeepTogether(par))
            linha = []
    if linha:
        par = Table([linha + [""]], colWidths=[88*mm, 88*mm])
        par.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                                 ("TOPPADDING", (0, 0), (-1, -1), 4)]))
        celulas.append(KeepTogether(par))
    story += celulas

    # ---- Assinaturas ----
    story.append(Spacer(1, 26))
    ass = Table([
        ["_" * 38, "_" * 38],
        [Paragraph(f"{gestor}<br/>Gestor responsável",
                   ParagraphStyle("a", fontName="Helvetica", fontSize=8, alignment=1, textColor=GRAY, leading=10)),
         Paragraph("Financeiro<br/>Telealpha",
                   ParagraphStyle("a2", fontName="Helvetica", fontSize=8, alignment=1, textColor=GRAY, leading=10))],
    ], colWidths=[85*mm, 85*mm])
    ass.setStyle(TableStyle([("ALIGN", (0, 0), (-1, -1), "CENTER"),
                             ("TEXTCOLOR", (0, 0), (-1, 0), GRAY)]))
    story.append(KeepTogether(ass))

    # rodapé com paginação
    def rodape(canvas, doc_):
        canvas.saveState()
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(GRAY)
        canvas.drawString(18*mm, 10*mm,
            f"Telealpha · Acerto de despesas · Documento {viagem['doc']}")
        canvas.drawRightString(A4[0] - 18*mm, 10*mm, f"Página {doc_.page}")
        canvas.setStrokeColor(BLUE)
        canvas.setLineWidth(0.8)
        canvas.line(18*mm, 13*mm, A4[0] - 18*mm, 13*mm)
        canvas.restoreState()

    doc.build(story, onFirstPage=rodape, onLaterPages=rodape)
    return saida


if __name__ == "__main__":
    # ---- Dados de exemplo (em produção, vêm do banco) ----
    viagem = {
        "nome": "Feira de Negócios do Nordeste",
        "destino": "Recife/PE",
        "inicio": "24/06/2026", "fim": "06/07/2026",
        "participantes": ["Ana Ribeiro", "Carlos Mota"],
        "fechada_em": "15/07/2026",
        "doc": "V2-2026",
    }
    despesas = [
        {"data": "25/06/2026", "colaborador": "Ana Ribeiro", "categoria": "Outros",
         "descricao": "Estacionamento aeroporto", "valor": 35.00, "status": "Recusado",
         "motivo": "Comprovante ilegível. Reenviar foto nítida.",
         "comprovante": "recibos/recibo_d5.png"},
        {"data": "28/06/2026", "colaborador": "Ana Ribeiro", "categoria": "Alimentação",
         "descricao": "Jantar em viagem", "valor": 54.20, "status": "Pago",
         "comprovante": "recibos/recibo_d4.png"},
        {"data": "01/07/2026", "colaborador": "Carlos Mota", "categoria": "Alimentação",
         "descricao": "Café com equipe de campo", "valor": 42.90, "status": "Pago",
         "comprovante": "recibos/recibo_d8.png"},
        {"data": "02/07/2026", "colaborador": "Carlos Mota", "categoria": "Hospedagem",
         "descricao": "Hospedagem — feira de negócios", "valor": 380.00, "status": "Aprovado",
         "comprovante": "recibos/recibo_d7.png"},
    ]
    print(gerar_relatorio(viagem, despesas, "Juliana Prado", "logo.png",
                          "relatorio-acerto-viagem-recife.pdf"))
