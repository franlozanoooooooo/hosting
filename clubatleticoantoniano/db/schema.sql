-- Club Atlético Antoniano — Esquema SQL de referencia (PostgreSQL 16)
-- Fuente de verdad de migraciones: Prisma (prisma/schema.prisma). Este SQL documenta
-- el modelo relacional, índices y restricciones de forma legible para DBA/auditoría.

BEGIN;

-- ───────── Tipos enumerados ─────────
CREATE TYPE rol            AS ENUM ('SUPER_ADMIN','ADMIN','COORDINADOR','ENTRENADOR','FAMILIA');
CREATE TYPE parentesco     AS ENUM ('PADRE','MADRE','TUTOR_LEGAL','OTRO');
CREATE TYPE estado_cuota   AS ENUM ('PENDIENTE','EN_REMESA','PAGADA','IMPAGADA','DEVUELTA','CONDONADA');
CREATE TYPE estado_pago    AS ENUM ('INICIADO','CONFIRMADO','FALLIDO','REEMBOLSADO');
CREATE TYPE estado_mandato AS ENUM ('PENDIENTE','ACTIVO','CANCELADO','EXPIRADO');
CREATE TYPE metodo_pago    AS ENUM ('SEPA_GOCARDLESS','TARJETA_STRIPE','TRANSFERENCIA','EFECTIVO');
CREATE TYPE tipo_documento AS ENUM ('FICHA_FEDERATIVA','AUTORIZACION','PROTECCION_DATOS','CERTIFICADO_MEDICO','OTRO');
CREATE TYPE tipo_evento    AS ENUM ('ENTRENAMIENTO','PARTIDO','EVENTO');

-- ───────── Identidad ─────────
CREATE TABLE usuario (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE,
  dni           TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  rol           rol  NOT NULL DEFAULT 'FAMILIA',
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_acceso TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT usuario_login_chk CHECK (email IS NOT NULL OR dni IS NOT NULL)
);

CREATE TABLE refresh_token (
  id         TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expira_en  TIMESTAMPTZ NOT NULL,
  revocado   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_usuario ON refresh_token(usuario_id);

CREATE TABLE tutor (
  id         TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL UNIQUE REFERENCES usuario(id),
  nombre     TEXT NOT NULL,
  apellidos  TEXT NOT NULL,
  dni        TEXT NOT NULL UNIQUE,
  telefono   TEXT,
  email      TEXT
);
CREATE INDEX idx_tutor_nombre ON tutor(apellidos, nombre);

CREATE TABLE staff (
  id         TEXT PRIMARY KEY,
  usuario_id TEXT NOT NULL UNIQUE REFERENCES usuario(id),
  nombre     TEXT NOT NULL,
  apellidos  TEXT NOT NULL,
  cargo      TEXT,
  telefono   TEXT
);

-- ───────── Deportivo ─────────
CREATE TABLE categoria (
  id       TEXT PRIMARY KEY,
  nombre   TEXT NOT NULL UNIQUE,
  edad_min INT,
  edad_max INT,
  orden    INT NOT NULL DEFAULT 0
);

CREATE TABLE equipo (
  id           TEXT PRIMARY KEY,
  nombre       TEXT NOT NULL,
  temporada    TEXT NOT NULL,
  categoria_id TEXT NOT NULL REFERENCES categoria(id),
  UNIQUE (nombre, temporada)
);
CREATE INDEX idx_equipo_categoria ON equipo(categoria_id);

CREATE TABLE staff_equipo (
  staff_id   TEXT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  equipo_id  TEXT NOT NULL REFERENCES equipo(id) ON DELETE CASCADE,
  rol_equipo TEXT NOT NULL,
  PRIMARY KEY (staff_id, equipo_id)
);

CREATE TABLE jugador (
  id               TEXT PRIMARY KEY,
  nombre           TEXT NOT NULL,
  apellidos        TEXT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  dorsal           INT,
  equipo_id        TEXT REFERENCES equipo(id),
  activo           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jugador_nombre ON jugador(apellidos, nombre);
CREATE INDEX idx_jugador_equipo ON jugador(equipo_id);

CREATE TABLE tutor_jugador (
  tutor_id              TEXT NOT NULL REFERENCES tutor(id) ON DELETE CASCADE,
  jugador_id            TEXT NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
  parentesco            parentesco NOT NULL DEFAULT 'TUTOR_LEGAL',
  es_contacto_principal BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (tutor_id, jugador_id)
);
CREATE INDEX idx_tj_jugador ON tutor_jugador(jugador_id);

-- ───────── Pagos ─────────
CREATE TABLE plan_cuota (
  id               TEXT PRIMARY KEY,
  nombre           TEXT NOT NULL,
  categoria_id     TEXT REFERENCES categoria(id),
  importe_centimos INT NOT NULL CHECK (importe_centimos >= 0),
  periodicidad     TEXT NOT NULL DEFAULT 'MENSUAL',
  dia_cobro        INT NOT NULL DEFAULT 5,
  activo           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE mandato_sepa (
  id                  TEXT PRIMARY KEY,
  tutor_id            TEXT NOT NULL REFERENCES tutor(id),
  provider_mandate_id TEXT UNIQUE,
  iban_last4          TEXT NOT NULL CHECK (char_length(iban_last4) = 4),
  titular             TEXT NOT NULL,
  estado              estado_mandato NOT NULL DEFAULT 'PENDIENTE',
  firmado_en          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mandato_tutor ON mandato_sepa(tutor_id);

CREATE TABLE remesa (
  id             TEXT PRIMARY KEY,
  referencia     TEXT NOT NULL UNIQUE,
  fecha_cobro    DATE NOT NULL,
  total_centimos INT NOT NULL DEFAULT 0,
  estado         TEXT NOT NULL DEFAULT 'BORRADOR',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cuota (
  id               TEXT PRIMARY KEY,
  jugador_id       TEXT NOT NULL REFERENCES jugador(id),
  plan_id          TEXT REFERENCES plan_cuota(id),
  periodo          TEXT NOT NULL,
  concepto         TEXT NOT NULL,
  importe_centimos INT NOT NULL CHECK (importe_centimos >= 0),
  estado           estado_cuota NOT NULL DEFAULT 'PENDIENTE',
  mandato_id       TEXT REFERENCES mandato_sepa(id),
  remesa_id        TEXT REFERENCES remesa(id),
  vence_en         DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (jugador_id, periodo, concepto)
);
CREATE INDEX idx_cuota_estado ON cuota(estado);
CREATE INDEX idx_cuota_remesa ON cuota(remesa_id);

CREATE TABLE pago (
  id                  TEXT PRIMARY KEY,
  cuota_id            TEXT REFERENCES cuota(id),
  metodo              metodo_pago NOT NULL,
  estado              estado_pago NOT NULL DEFAULT 'INICIADO',
  importe_centimos    INT NOT NULL,
  provider_payment_id TEXT UNIQUE,
  recibo_url          TEXT,
  pagado_en           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pago_cuota ON pago(cuota_id);

-- ───────── Documentos ─────────
CREATE TABLE documento (
  id          TEXT PRIMARY KEY,
  jugador_id  TEXT NOT NULL REFERENCES jugador(id) ON DELETE CASCADE,
  tipo        tipo_documento NOT NULL,
  nombre      TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  caduca_en   DATE,
  subido_por  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_documento_jugador ON documento(jugador_id, tipo);

-- ───────── Comunicaciones / Calendario ─────────
CREATE TABLE comunicacion (
  id              TEXT PRIMARY KEY,
  titulo          TEXT NOT NULL,
  cuerpo          TEXT NOT NULL,
  urgente         BOOLEAN NOT NULL DEFAULT FALSE,
  es_convocatoria BOOLEAN NOT NULL DEFAULT FALSE,
  autor_id        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comunicacion_destino (
  id              TEXT PRIMARY KEY,
  comunicacion_id TEXT NOT NULL REFERENCES comunicacion(id) ON DELETE CASCADE,
  usuario_id      TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  leido_en        TIMESTAMPTZ,
  UNIQUE (comunicacion_id, usuario_id)
);
CREATE INDEX idx_cd_usuario ON comunicacion_destino(usuario_id);

CREATE TABLE evento (
  id         TEXT PRIMARY KEY,
  equipo_id  TEXT REFERENCES equipo(id),
  tipo       tipo_evento NOT NULL,
  titulo     TEXT NOT NULL,
  inicio     TIMESTAMPTZ NOT NULL,
  fin        TIMESTAMPTZ,
  lugar      TEXT,
  rival      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_evento_equipo ON evento(equipo_id, inicio);

-- ───────── Web pública ─────────
CREATE TABLE categoria_noticia (
  id     TEXT PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  slug   TEXT NOT NULL UNIQUE
);

CREATE TABLE noticia (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL UNIQUE,
  titulo       TEXT NOT NULL,
  extracto     TEXT,
  cuerpo       TEXT NOT NULL,
  portada_url  TEXT,
  destacada    BOOLEAN NOT NULL DEFAULT FALSE,
  publicada    BOOLEAN NOT NULL DEFAULT FALSE,
  publicada_en TIMESTAMPTZ,
  categoria_id TEXT REFERENCES categoria_noticia(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_noticia_pub ON noticia(publicada, publicada_en);

CREATE TABLE evento_entrada (
  id              TEXT PRIMARY KEY,
  titulo          TEXT NOT NULL,
  fecha           TIMESTAMPTZ NOT NULL,
  lugar           TEXT,
  precio_centimos INT NOT NULL CHECK (precio_centimos >= 0),
  aforo           INT,
  vendidas        INT NOT NULL DEFAULT 0,
  activo          BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE compra_entrada (
  id                  TEXT PRIMARY KEY,
  evento_id           TEXT NOT NULL REFERENCES evento_entrada(id),
  usuario_id          TEXT REFERENCES usuario(id),
  email_comprador     TEXT,
  cantidad            INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  importe_centimos    INT NOT NULL,
  estado              estado_pago NOT NULL DEFAULT 'INICIADO',
  provider_payment_id TEXT UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_compra_evento ON compra_entrada(evento_id);

-- ───────── RGPD / Auditoría ─────────
CREATE TABLE audit_log (
  id         TEXT PRIMARY KEY,
  usuario_id TEXT REFERENCES usuario(id),
  accion     TEXT NOT NULL,
  entidad    TEXT,
  entidad_id TEXT,
  ip         TEXT,
  user_agent TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_usuario ON audit_log(usuario_id, created_at);
CREATE INDEX idx_audit_entidad ON audit_log(entidad, entidad_id);

CREATE TABLE consentimiento (
  id          TEXT PRIMARY KEY,
  usuario_id  TEXT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL,
  version     TEXT NOT NULL,
  otorgado    BOOLEAN NOT NULL DEFAULT TRUE,
  otorgado_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  revocado_en TIMESTAMPTZ
);
CREATE INDEX idx_consent_usuario ON consentimiento(usuario_id, tipo);

COMMIT;
