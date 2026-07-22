-- ============================================================
-- ACERTO & CONCILIAÇÃO DE DESPESAS — Schema PostgreSQL/Supabase
-- ============================================================

-- ---------- TIPOS ----------
CREATE TYPE papel_usuario AS ENUM ('colaborador', 'gestor');
CREATE TYPE status_despesa AS ENUM ('pendente', 'aprovado', 'recusado', 'pago');
CREATE TYPE status_viagem  AS ENUM ('aberta', 'em_acerto', 'fechada');

-- ---------- USUÁRIOS ----------
-- No Supabase, esta tabela referencia auth.users (autenticação nativa).
-- Fora do Supabase, adicione uma coluna senha_hash.
CREATE TABLE usuarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- REFERENCES auth.users(id) ON DELETE CASCADE, -- (Supabase)
    nome          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    papel         papel_usuario NOT NULL DEFAULT 'colaborador',
    gestor_id     UUID REFERENCES usuarios(id),   -- gestor direto do colaborador
    centro_custo  TEXT,
    ativo         BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- CATEGORIAS ----------
CREATE TABLE categorias (
    id         SERIAL PRIMARY KEY,
    nome       TEXT NOT NULL UNIQUE,
    icone      TEXT,                              -- nome do ícone no front
    limite_mensal NUMERIC(12,2),                  -- opcional: teto por categoria
    ativo      BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO categorias (nome, icone) VALUES
    ('Combustível', 'fuel'),
    ('Alimentação', 'utensils'),
    ('Hospedagem',  'bed'),
    ('Outros',      'receipt');

-- ---------- VIAGENS ----------
-- Unidade de acerto: o gestor cria a viagem, define o período
-- e inclui os participantes. O fechamento é sempre por viagem.
CREATE TABLE viagens (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome           TEXT NOT NULL,
    destino        TEXT NOT NULL,
    data_inicio    DATE NOT NULL,
    data_fim       DATE NOT NULL,
    status         status_viagem NOT NULL DEFAULT 'aberta',
    adiantamento   NUMERIC(12,2) DEFAULT 0,   -- valor adiantado à equipe (opcional)
    criada_por     UUID NOT NULL REFERENCES usuarios(id),
    fechada_por    UUID REFERENCES usuarios(id),
    fechada_em     TIMESTAMPTZ,
    relatorio_url  TEXT,                       -- PDF do acerto no Storage (bucket 'relatorios')
    criado_em      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT periodo_valido CHECK (data_fim >= data_inicio),
    CONSTRAINT fechamento_completo
        CHECK (status <> 'fechada' OR (fechada_por IS NOT NULL AND fechada_em IS NOT NULL))
);

-- Participantes da viagem (N:N) — só participantes podem lançar despesa nela
CREATE TABLE viagem_participantes (
    viagem_id   UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
    usuario_id  UUID NOT NULL REFERENCES usuarios(id),
    incluido_em TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (viagem_id, usuario_id)
);

CREATE INDEX idx_participantes_usuario ON viagem_participantes (usuario_id);

-- ---------- DESPESAS ----------
CREATE TABLE despesas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_id       UUID NOT NULL REFERENCES viagens(id),
    usuario_id      UUID NOT NULL REFERENCES usuarios(id),
    categoria_id    INT  NOT NULL REFERENCES categorias(id),
    valor           NUMERIC(12,2) NOT NULL CHECK (valor > 0),
    data_despesa    DATE NOT NULL,
    descricao       TEXT NOT NULL,
    comprovante_url TEXT,            -- caminho no Supabase Storage (bucket 'comprovantes')
    ocr_dados       JSONB,           -- payload bruto retornado pelo OCR
    status          status_despesa NOT NULL DEFAULT 'pendente',
    motivo_recusa   TEXT,
    aprovado_por    UUID REFERENCES usuarios(id),
    aprovado_em     TIMESTAMPTZ,
    pago_em         TIMESTAMPTZ,
    criado_em       TIMESTAMPTZ NOT NULL DEFAULT now(),
    atualizado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- recusa exige motivo
    CONSTRAINT recusa_exige_motivo
        CHECK (status <> 'recusado' OR motivo_recusa IS NOT NULL)
);

CREATE INDEX idx_despesas_viagem    ON despesas (viagem_id);
CREATE INDEX idx_despesas_usuario   ON despesas (usuario_id);
CREATE INDEX idx_despesas_status    ON despesas (status);
CREATE INDEX idx_despesas_data      ON despesas (data_despesa);
CREATE INDEX idx_despesas_categoria ON despesas (categoria_id);

-- ---------- HISTÓRICO / AUDITORIA ----------
-- Trilha imutável de mudanças de status (compliance financeiro).
CREATE TABLE despesa_eventos (
    id            BIGSERIAL PRIMARY KEY,
    despesa_id    UUID NOT NULL REFERENCES despesas(id) ON DELETE CASCADE,
    usuario_id    UUID NOT NULL REFERENCES usuarios(id), -- quem executou a ação
    status_de     status_despesa,
    status_para   status_despesa NOT NULL,
    observacao    TEXT,
    criado_em     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_eventos_despesa ON despesa_eventos (despesa_id);

-- ---------- TRIGGERS ----------
-- Mantém atualizado_em em dia
CREATE OR REPLACE FUNCTION fn_touch_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_despesas_touch
BEFORE UPDATE ON despesas
FOR EACH ROW EXECUTE FUNCTION fn_touch_atualizado_em();

-- Registra automaticamente cada mudança de status na auditoria
CREATE OR REPLACE FUNCTION fn_log_evento_status()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO despesa_eventos (despesa_id, usuario_id, status_de, status_para)
        VALUES (NEW.id, NEW.usuario_id, NULL, NEW.status);
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO despesa_eventos (despesa_id, usuario_id, status_de, status_para, observacao)
        VALUES (NEW.id, COALESCE(NEW.aprovado_por, NEW.usuario_id),
                OLD.status, NEW.status, NEW.motivo_recusa);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_despesas_log_status
AFTER INSERT OR UPDATE ON despesas
FOR EACH ROW EXECUTE FUNCTION fn_log_evento_status();

-- Integridade do fluxo por viagem:
-- 1) só participante lança despesa na viagem; 2) viagem fechada não recebe lançamento
CREATE OR REPLACE FUNCTION fn_valida_despesa_viagem()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM viagem_participantes vp
        WHERE vp.viagem_id = NEW.viagem_id AND vp.usuario_id = NEW.usuario_id
    ) THEN
        RAISE EXCEPTION 'Usuário não é participante desta viagem';
    END IF;
    IF (SELECT status FROM viagens WHERE id = NEW.viagem_id) = 'fechada' THEN
        RAISE EXCEPTION 'Viagem já fechada: não aceita novos lançamentos';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_despesas_valida_viagem
BEFORE INSERT ON despesas
FOR EACH ROW EXECUTE FUNCTION fn_valida_despesa_viagem();

-- Fechamento do acerto: só permite fechar se não houver pendências.
-- Chamar via RPC no Supabase: select fechar_acerto_viagem('<viagem_id>');
CREATE OR REPLACE FUNCTION fechar_acerto_viagem(p_viagem_id UUID)
RETURNS viagens AS $$
DECLARE
    v_pendentes INT;
    v_viagem viagens;
BEGIN
    SELECT COUNT(*) INTO v_pendentes
    FROM despesas WHERE viagem_id = p_viagem_id AND status = 'pendente';

    IF v_pendentes > 0 THEN
        RAISE EXCEPTION 'Acerto não pode ser fechado: % despesa(s) pendente(s)', v_pendentes;
    END IF;

    UPDATE viagens
    SET status = 'fechada', fechada_por = auth.uid(), fechada_em = now()
    WHERE id = p_viagem_id
    RETURNING * INTO v_viagem;

    RETURN v_viagem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------- VIEWS ÚTEIS ----------
-- Acerto por viagem (alimenta a tela de fechamento e o PDF)
CREATE VIEW vw_acerto_viagem AS
SELECT
    v.id AS viagem_id,
    v.nome, v.destino, v.data_inicio, v.data_fim, v.status,
    v.adiantamento,
    COUNT(d.id)                                               AS qtd_despesas,
    COUNT(*) FILTER (WHERE d.status = 'pendente')             AS qtd_pendentes,
    COALESCE(SUM(d.valor) FILTER (WHERE d.status IN ('aprovado','pago')), 0) AS total_aprovado,
    COALESCE(SUM(d.valor) FILTER (WHERE d.status = 'recusado'), 0)           AS total_recusado,
    COALESCE(SUM(d.valor) FILTER (WHERE d.status IN ('aprovado','pago')), 0)
        - COALESCE(v.adiantamento, 0)                         AS saldo_a_reembolsar
FROM viagens v
LEFT JOIN despesas d ON d.viagem_id = v.id
GROUP BY v.id;

-- Resumo por colaborador (alimenta o dashboard do colaborador em 1 query)
CREATE VIEW vw_resumo_colaborador AS
SELECT
    usuario_id,
    COALESCE(SUM(valor) FILTER (WHERE status = 'aprovado'), 0) AS total_aprovado,
    COALESCE(SUM(valor) FILTER (WHERE status = 'pendente'), 0) AS total_pendente,
    COALESCE(SUM(valor) FILTER (WHERE status = 'pago'),     0) AS total_pago,
    COUNT(*) FILTER (WHERE status = 'pendente')               AS qtd_pendentes
FROM despesas
GROUP BY usuario_id;

-- Resumo mensal por categoria (alimenta o dashboard do gestor)
CREATE VIEW vw_gastos_mensais AS
SELECT
    date_trunc('month', data_despesa)::date AS mes,
    c.nome AS categoria,
    SUM(d.valor) AS total,
    COUNT(*)     AS qtd
FROM despesas d
JOIN categorias c ON c.id = d.categoria_id
WHERE d.status IN ('aprovado', 'pago')
GROUP BY 1, 2;

-- ---------- ROW LEVEL SECURITY (Supabase) ----------
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Colaborador vê e cria apenas as próprias despesas
CREATE POLICY despesas_select_proprias ON despesas
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY despesas_insert_proprias ON despesas
    FOR INSERT WITH CHECK (usuario_id = auth.uid() AND status = 'pendente');

-- Gestor vê e atualiza tudo (aprovar / recusar / marcar como pago)
CREATE POLICY despesas_gestor_select ON despesas
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );

CREATE POLICY despesas_gestor_update ON despesas
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM usuarios u
                WHERE u.id = auth.uid() AND u.papel = 'gestor')
    );
