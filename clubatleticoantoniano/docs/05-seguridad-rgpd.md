# 05 · Seguridad y RGPD (Entregable de Seguridad)

> Autor: Experto en Seguridad y RGPD · Revisado por Arquitecto, PM y Pagos.
> Ámbito: plataforma del **Club Atlético Antoniano** (web pública + intranet/admin) que trata
> **datos personales de MENORES de edad** y de sus tutores legales (DNI, fecha de nacimiento,
> certificados médicos, datos bancarios vía mandato SEPA).
> Implementación canónica del modelo: [`prisma/schema.prisma`](../prisma/schema.prisma).

---

## 0. Resumen ejecutivo

La plataforma trata categorías de datos especialmente sensibles porque la mayoría de los
interesados son **menores de edad** y porque maneja **datos de salud** (certificados médicos) y
**datos financieros** (mandatos SEPA). Ello eleva el riesgo y exige:

- Consentimiento prestado y verificado por los **titulares de la patria potestad o tutela** (art. 8 RGPD; art. 7 LOPDGDD: 14 años como umbral en España, irrelevante aquí porque la cantera es de menores de esa edad y, en todo caso, el consentimiento para imagen y comunicaciones lo presta el tutor).
- Minimización de datos (el IBAN completo **no** se persiste; lo custodia GoCardless).
- Trazabilidad completa de accesos a datos sensibles mediante `audit_log`.
- Contratos de encargado del tratamiento (DPA) con todos los proveedores.
- Probable necesidad de **Evaluación de Impacto (EIPD/DPIA)** por tratamiento a gran escala de datos de menores y de salud (art. 35.3 RGPD).

---

## 1. Marco legal aplicable

### 1.1 Normativa

| Norma | Relevancia |
|-------|------------|
| **Reglamento (UE) 2016/679 (RGPD)** | Marco general de protección de datos. |
| **LO 3/2018 (LOPDGDD)** | Desarrollo en España; consentimiento de menores (art. 7), derechos, sanciones. |
| **Art. 8 RGPD** | Condiciones del consentimiento de los niños en servicios de la sociedad de la información. |
| **Art. 9 RGPD** | Categorías especiales (datos de salud → certificados médicos). |
| **LSSI-CE (Ley 34/2002)** | Comunicaciones comerciales electrónicas, cookies. |
| **Reglamento eIDAS / normativa SEPA (Rulebook EPC)** | Mandatos de adeudo directo. |
| **Ley 58/2003 General Tributaria y Código de Comercio** | Conservación de justificantes contables (6 años). |

### 1.2 Tratamiento de datos de menores

- La práctica totalidad de los **jugadores** son menores. **No pueden prestar consentimiento válido por sí mismos**: lo otorga quien ostenta la **patria potestad o tutela** (registrado en `tutor_jugador.parentesco`).
- El umbral del art. 7 LOPDGDD (14 años) **no habilita** al menor para imagen ni comunicaciones cuando el club lo trata como cantera infantil; se exige siempre consentimiento del tutor para los tratamientos basados en consentimiento.
- Se aplica **esfuerzo razonable de verificación** de la titularidad de la patria potestad (declaración responsable del tutor en el alta + DNI; registro en `consentimiento` con versión del texto).
- Lenguaje **claro y adaptado** en los textos legales dirigidos a familias (art. 12 RGPD).

### 1.3 Base jurídica por tratamiento (art. 6 RGPD)

| Tratamiento | Base jurídica | Notas |
|-------------|---------------|-------|
| Inscripción del jugador y gestión deportiva (equipo, ficha) | **Ejecución de contrato** (art. 6.1.b) con el tutor | El tutor contrata los servicios del club para el menor. |
| Gestión de cuotas, remesas y pagos (SEPA/tarjeta) | **Ejecución de contrato** (art. 6.1.b) | Necesario para cobrar el servicio contratado. |
| Conservación de justificantes de pago / facturación | **Obligación legal** (art. 6.1.c) | Código de Comercio / LGT (6 años). |
| Certificados médicos / aptitud deportiva | **Consentimiento explícito** (art. 9.2.a) + interés en proteger la salud del menor | Dato de salud (categoría especial art. 9). |
| **Imagen del menor** (fotos/vídeo en web, RRSS, prensa) | **Consentimiento** del tutor (art. 6.1.a) | Granular y revocable; nunca obligatorio para inscribirse. |
| Comunicaciones del club por email/push (convocatorias, avisos) operativas | **Ejecución de contrato / interés legítimo** | Avisos imprescindibles del servicio. |
| Comunicaciones **comerciales/marketing** | **Consentimiento** (art. 6.1.a + LSSI) | Opt-in separado, revocable. |
| Venta de entradas a no socios | **Ejecución de contrato** (art. 6.1.b) | `compra_entrada` con `email_comprador`. |
| Auditoría y seguridad (`audit_log`) | **Obligación legal + interés legítimo** (art. 6.1.c/f) | Responsabilidad proactiva (art. 5.2). |

---

## 2. Roles RGPD

| Rol | Entidad | Función |
|-----|---------|---------|
| **Responsable del tratamiento** | Club Atlético Antoniano | Decide fines y medios. Titular del RAT y de las relaciones con interesados y AEPD. |
| **Delegado de Protección de Datos (DPO)** | Persona designada por el club | Recomendable/obligatorio si hay tratamiento a gran escala de datos de menores o de salud (art. 37 RGPD). Punto de contacto en la política de privacidad. |
| **Encargado del tratamiento** | **GoCardless** | Procesa mandatos SEPA y cobros. Custodia el IBAN completo. |
| **Encargado del tratamiento** | **Stripe** | Pagos con tarjeta (entradas, cuotas puntuales). PCI-DSS. |
| **Encargado del tratamiento** | **Supabase / proveedor S3** | Base de datos gestionada y storage de documentos (incl. certificados médicos). |
| **Encargado del tratamiento** | **Proveedor de email** (p. ej. Resend/SendGrid/Postmark) | Envío transaccional y comunicaciones. |
| **Encargado del tratamiento** | Hosting (Vercel / Railway o VPS) | Ejecución de front y API. |

### 2.1 Contratos de encargado (DPA)

- **Obligatorio** firmar **DPA / Art. 28 RGPD** con cada encargado antes de tratar datos reales.
- Verificar **transferencias internacionales** (Stripe, GoCardless, Vercel pueden tratar datos fuera del EEE): exigir **Cláusulas Contractuales Tipo (SCC)** o adecuación, y preferir regiones UE en Supabase/S3.
- Mantener un **inventario de encargados y subencargados** con enlace al DPA y a la región de tratamiento.
- Prohibir el uso de datos para fines propios del encargado; exigir notificación de brechas y borrado/devolución al finalizar.

---

## 3. Registro de Actividades de Tratamiento (RAT) — art. 30 RGPD

| Actividad | Finalidad | Base jurídica | Categorías de datos | Interesados | Encargados | Conservación |
|-----------|-----------|---------------|---------------------|-------------|------------|--------------|
| Gestión de socios/jugadores | Inscripción y gestión deportiva | Contrato | Nombre, apellidos, fecha nacimiento, dorsal, equipo (`jugador`) | Menores | Supabase | Mientras dure la relación + plazo de reclamaciones; anonimización a baja + 1 año |
| Gestión de tutores | Identificar al responsable legal y de pago | Contrato | Nombre, DNI, teléfono, email (`tutor`, `usuario`) | Tutores | Supabase, email | Igual que socio del menor vinculado |
| Cobro de cuotas (SEPA) | Cobrar el servicio | Contrato | Titular, IBAN last4, `mandate_id`, importe, estado (`mandato_sepa`, `cuota`, `remesa`, `pago`) | Tutores | GoCardless, Supabase | 6 años (justificantes contables) |
| Cobro con tarjeta | Pagos puntuales / entradas | Contrato | Email comprador, `provider_payment_id`, importe | Tutores / público | Stripe | 6 años justificantes; tokens en Stripe |
| Documentos del jugador | Ficha federativa, autorizaciones, **certificados médicos** | Consentimiento (salud) / contrato | Documento, tipo, `storage_key`, caducidad (`documento`) | Menores | S3/Supabase | Médicos: vigencia + retirada al caducar; resto: relación + plazo legal |
| Imagen del menor | Difusión institucional/RRSS | Consentimiento | Foto/vídeo del menor | Menores | S3, email, RRSS | Hasta revocación; retirada al revocar |
| Comunicaciones | Avisos, convocatorias, marketing | Contrato / interés legítimo / consentimiento (marketing) | Email, push, lectura (`comunicacion`, `comunicacion_destino`) | Tutores | Email | Relación + revocación |
| Auditoría y seguridad | Trazabilidad, prevención de fraude | Obligación legal / interés legítimo | Usuario, acción, IP, user-agent (`audit_log`) | Usuarios | Supabase | Ver §7 (p. ej. 1–2 años; financieros 6 años) |

> El RAT debe mantenerse vivo y firmado por el responsable; este apartado es su base.

---

## 4. Derechos del interesado (ARCO-POL)

Los derechos se ejercen por el **tutor en nombre del menor**. Canal: formulario/correo del DPO + verificación de identidad (DNI del tutor) y de su relación con el menor (`tutor_jugador`). Plazo de respuesta: **1 mes** (prorrogable a 3 por complejidad, art. 12.3).

| Derecho | Implementación técnica | Endpoint / proceso |
|---------|------------------------|--------------------|
| **Acceso** (art. 15) | Recopilación de todos los registros del interesado y sus menores vinculados. | `GET /rgpd/export` → genera ZIP/JSON (datos de `usuario`, `tutor`, `jugador`, `cuota`, `pago`, `documento`, `consentimiento`, `comunicacion_destino`). Solo el propio titular o ADMIN con motivo. |
| **Rectificación** (art. 16) | Edición de perfil/datos en intranet; cambios trazados en `audit_log`. | `PATCH /tutores/:id`, `PATCH /jugadores/:id`. |
| **Supresión / olvido** (art. 17) | **Anonimización**, no borrado físico, cuando hay obligación contable. Se sustituyen identificadores por valores irreversibles y se eliminan documentos sensibles. | `POST /rgpd/anonimizar/:usuarioId` (solo SUPER_ADMIN, auditado). Conserva importes/`provider_payment_id` en `pago`/`cuota` por obligación legal; borra DNI, nombre, email, teléfono, certificados médicos. |
| **Oposición** (art. 21) | Baja de marketing y de tratamientos basados en interés legítimo. | Revocar `consentimiento` tipo `COMUNICACIONES`; flag de exclusión en envíos. |
| **Portabilidad** (art. 20) | Exportación en formato estructurado y legible por máquina (JSON). | Reutiliza `GET /rgpd/export` (solo datos aportados por el interesado y tratados por contrato/consentimiento). |
| **Limitación** (art. 18) | Marcado del registro como "limitado": se conserva pero no se trata (salvo conservación). | Campo de estado/flag `activo=false` + bloqueo de procesos automáticos (remesas, comunicaciones). |

### 4.1 Proceso de anonimización (supresión con retención legal)

1. Verificar que no existan **cuotas pendientes/remesas en curso**.
2. Borrar físicamente: `documento` (especialmente `CERTIFICADO_MEDICO`) del storage + fila; revocar consentimientos; eliminar imagen del menor de medios.
3. Anonimizar PII en `usuario`/`tutor`/`jugador` (hash o sustitución: `email=null`, `dni=ANON-<id>`, nombres genéricos).
4. **Conservar** `pago`, `cuota`, `remesa` (importes y `provider_payment_id`) durante 6 años por obligación contable, desvinculados de PII identificable.
5. Registrar la operación en `audit_log` (`accion="ANONIMIZAR_USUARIO"`).

---

## 5. Gestión del consentimiento (tabla `consentimiento`)

Modelo: `Consentimiento { usuarioId, tipo, version, otorgado, otorgadoEn, revocadoEn }`.

- **Granular**: un registro por finalidad → tipos `PROTECCION_DATOS`, `IMAGEN_MENOR`, `COMUNICACIONES`.
- **Versionado**: `version` guarda la versión del texto legal aceptado; al cambiar la política se solicita reconsentimiento y se crea un nuevo registro (no se sobrescribe el anterior → prueba histórica).
- **Revocable**: `revocadoEn` marca la retirada; tan fácil de retirar como de otorgar (art. 7.3). La revocación **no** afecta a la licitud previa ni a tratamientos con otra base jurídica (p. ej. cuotas por contrato).
- **No condicionado**: la inscripción del menor **no** depende de consentir imagen ni marketing (art. 7.4); estos casillas van desmarcadas por defecto (sin opt-in tácito).
- **Trazabilidad**: cada otorgamiento/revocación se refleja también en `audit_log` (quién, cuándo, IP).
- Para imagen del menor: el tutor que consiente debe ser el titular de la patria potestad; si hay dos progenitores, el consentimiento de imagen pública requiere acuerdo de ambos (criterio recomendado para difusión).

---

## 6. Seguridad técnica

### 6.1 Autenticación

- **Hash de contraseñas: Argon2id**. Parámetros recomendados (OWASP): `memoryCost ≥ 19 MiB (≈19456 KiB)`, `timeCost (iterations) = 2`, `parallelism = 1`, `salt ≥ 16 bytes`, `hashLength = 32`. Ajustar al hardware del servidor.
- **JWT de acceso**: vida corta **15 min**, firmado (HS256/RS256 con secreto/clave en gestor de secretos), claims mínimos (`sub`, `rol`).
- **Refresh token rotativo**: almacenado **hasheado** en `refresh_token.tokenHash` (nunca en claro). En cada uso se **rota** (se revoca el anterior, `revocado=true`, y se emite uno nuevo). Detección de reutilización → revocación de toda la familia de tokens del usuario.
- **Cookies** `httpOnly`, `Secure`, `SameSite=Strict` (o `Lax` si hay flujo de pago cross-site), `Path` acotado. Sin tokens en `localStorage`.
- **Bloqueo por intentos**: tras N (p. ej. 5) fallos, bloqueo temporal exponencial de la cuenta/IP; registro en `audit_log` (`accion="LOGIN_FALLIDO"`).
- **Rate limiting** estricto en `/auth/login`, `/auth/refresh`, `/auth/recuperar` y `/auth/reset` (p. ej. NestJS `ThrottlerGuard`). Tokens de recuperación de un solo uso, vida corta y hasheados.
- `usuario.ultimoAcceso` actualizado para detección de cuentas inactivas.

### 6.2 Autorización (RBAC)

Cinco roles (`Rol`): `SUPER_ADMIN`, `ADMIN`, `COORDINADOR`, `ENTRENADOR`, `FAMILIA`.

- **Guard de roles** en NestJS (`@Roles()` + `RolesGuard`) sobre cada endpoint.
- **Scoping de datos** (no solo de rol):
  - `FAMILIA` → solo accede a **sus** jugadores vinculados vía `tutor_jugador` y a sus propios pagos/documentos.
  - `ENTRENADOR` → solo jugadores de **sus equipos** (`staff_equipo`).
  - `COORDINADOR` → categorías/equipos asignados.
  - `ADMIN`/`SUPER_ADMIN` → ámbito completo (auditado).
- **Verificación de propiedad** en cada consulta para prevenir **IDOR** (ver §6.4): el filtro por propietario se aplica siempre en la query Prisma, nunca confiando en el ID del cliente.
- **Opción Row Level Security (RLS) en PostgreSQL**: definir políticas por `usuario_id`/relación con sesión (`SET app.current_user`) como **defensa en profundidad** además del scoping en la API. Especialmente útil con Supabase. Recomendado al menos para `documento`, `cuota`, `mandato_sepa`.

### 6.3 Cifrado

- **En tránsito**: TLS 1.2+ obligatorio (HSTS); redirección forzada a HTTPS; webhooks solo por HTTPS con verificación de firma.
- **En reposo**: cifrado del volumen de BD (gestionado por Supabase/proveedor) y del bucket de storage (SSE-S3 / KMS). Considerar cifrado a nivel de columna para campos especialmente sensibles si no basta el cifrado de disco.
- **Documentos sensibles (certificados médicos)**: nunca URLs públicas. Acceso mediante **URLs firmadas temporales** (TTL corto, p. ej. 60–300 s) generadas por la API tras verificar autorización; `documento.storage_key` privado.
- **Minimización financiera**: el **IBAN completo no se persiste**; solo `iban_last4` + `provider_mandate_id` (GoCardless custodia el dato). Tarjeta: tokenizada en Stripe, fuera de alcance PCI propio.

### 6.4 Protección OWASP Top 10

| Riesgo | Mitigación |
|--------|------------|
| **Inyección SQL** | Prisma con consultas parametrizadas; prohibido `$queryRawUnsafe` con interpolación. |
| **XSS** | Sanitización de entrada/salida; React escapa por defecto (evitar `dangerouslySetInnerHTML`); **CSP** restrictiva (`default-src 'self'`). |
| **CSRF** | Cookies `SameSite` + **token anti-CSRF** (double-submit) en mutaciones de la intranet/admin. |
| **SSRF** | Sin fetch a URLs controladas por el usuario; allow-list de hosts para webhooks/integraciones. |
| **IDOR / Broken Access Control** | Verificación de propiedad y scoping en cada acceso (§6.2); IDs opacos (`cuid`). |
| **Cabeceras de seguridad** | **helmet** (HSTS, X-Content-Type-Options, X-Frame-Options/`frame-ancestors`, Referrer-Policy, CSP). |
| **Validación de entrada** | **zod** en cada DTO/borde de la API (tipos, longitudes, formatos: DNI, IBAN, email). Rechazo por defecto. |
| **Componentes vulnerables** | `npm audit`/Dependabot; actualización de dependencias. |
| **Logging y monitorización** | `audit_log` + alertas (§7). Nunca registrar contraseñas, tokens ni IBAN completo en logs. |
| **SSRF/Upload** | Validar `mime_type` y tamaño de documentos; antivirus opcional; nombres de fichero no confiables. |

### 6.5 Gestión de secretos

- Secretos **fuera del repositorio**: variables de entorno en el proveedor / gestor de secretos (Vercel/Railway secrets, Doppler, o Vault). `.env` en `.gitignore`.
- Secretos distintos por entorno (dev/staging/prod); claves de webhook de Stripe/GoCardless por entorno.
- **Rotación** periódica de: secreto de firma JWT, claves de proveedores de pago, credenciales de BD y storage, claves de API de email. Procedimiento documentado y sin downtime (doble clave durante la rotación del secreto JWT).
- Acceso a producción mínimo (principio de mínimo privilegio) y auditado.

---

## 7. Auditoría (`audit_log`)

Modelo: `AuditLog { usuarioId, accion, entidad, entidadId, ip, userAgent, metadata, createdAt }`.

- **Qué se audita siempre**:
  - Accesos a **datos sensibles**: `VER_DOCUMENTO` (certificado médico), `EXPORTAR_DATOS`.
  - **Acciones de pago**: creación/cobro de cuotas, generación/envío de remesas, alta/cancelación de mandatos, reembolsos.
  - **Autenticación**: `LOGIN`, `LOGIN_FALLIDO`, `REFRESH`, cambios de contraseña/rol.
  - **RGPD**: otorgar/revocar consentimiento, `ANONIMIZAR_USUARIO`.
- **Contenido**: quién (`usuarioId`), qué (`accion`/`entidad`/`entidadId`), cuándo (`createdAt`), desde dónde (`ip`, `userAgent`). `metadata` para contexto (sin PII innecesaria ni secretos).
- **Inmutabilidad**: tabla **solo-append**; revocar `UPDATE`/`DELETE` a la cuenta de aplicación sobre `audit_log` (rol de BD dedicado); idealmente envío adicional a un almacén WORM/SIEM externo.
- **Retención**: logs de seguridad **1–2 años**; los vinculados a operaciones contables/pagos **6 años**. Particionado por fecha (ya previsto en el modelo de datos) y purga automática al expirar.
- **Alertas**: patrones anómalos (picos de `LOGIN_FALLIDO`, accesos masivos a documentos, exportaciones) generan aviso al DPO/admin.

---

## 8. Gestión de brechas de seguridad

Procedimiento ante violación de la seguridad de los datos (arts. 33 y 34 RGPD):

1. **Detección y contención** (inmediata): aislar el sistema afectado, revocar credenciales/tokens comprometidos, preservar evidencias (`audit_log`, logs del proveedor).
2. **Evaluación**: alcance, categorías y volumen de datos afectados, si hay datos de **menores/salud/financieros** (eleva el riesgo).
3. **Notificación a la AEPD**: dentro de **72 horas** desde que se tiene constancia, salvo que sea improbable que entrañe riesgo para los derechos y libertades (sede electrónica AEPD). Si no se cumple el plazo, justificar la demora.
4. **Notificación a los interesados** (tutores): **sin dilación indebida** cuando exista **alto riesgo** (art. 34), en lenguaje claro, con medidas recomendadas y contacto del DPO.
5. **Registro interno de la brecha**: toda violación se documenta (hechos, efectos, medidas), exista o no notificación (art. 33.5).
6. **Post-mortem y mejora**: causa raíz, acciones correctivas, actualización de medidas.

Responsable de coordinación: **DPO** + responsable técnico. Plantilla de notificación y árbol de decisión mantenidos junto a este documento.

---

## 9. Checklist de cumplimiento

### Legal / organizativo
- [ ] RAT (§3) redactado, firmado por el responsable y mantenido actualizado.
- [ ] Política de privacidad y avisos legales publicados, en lenguaje claro para familias.
- [ ] DPO designado y publicado como punto de contacto (valorar obligatoriedad por menores/salud).
- [ ] **EIPD/DPIA** realizada (tratamiento a gran escala de menores y datos de salud).
- [ ] DPA (art. 28) firmados con GoCardless, Stripe, Supabase/S3, proveedor de email y hosting.
- [ ] Transferencias internacionales cubiertas con SCC / regiones UE verificadas.
- [ ] Inventario de encargados y subencargados actualizado.

### Consentimiento y menores
- [ ] Consentimiento del **tutor** verificado para imagen e información de menores.
- [ ] Consentimientos granulares (`PROTECCION_DATOS`, `IMAGEN_MENOR`, `COMUNICACIONES`), versionados y revocables (`consentimiento`).
- [ ] Casillas de imagen/marketing **desmarcadas por defecto**; inscripción no condicionada a ellas.
- [ ] Verificación razonable de la patria potestad/tutela.

### Derechos
- [ ] Endpoint de **exportación** (`GET /rgpd/export`) en formato legible por máquina operativo.
- [ ] Proceso de **anonimización** (`POST /rgpd/anonimizar/:usuarioId`) que respeta la retención contable.
- [ ] Canal y plazo (1 mes) de atención de derechos ARCO-POL documentado.

### Seguridad técnica
- [ ] Argon2id con parámetros OWASP en producción.
- [ ] JWT access 15 min + refresh rotativo hasheado con detección de reutilización.
- [ ] Cookies `httpOnly` + `Secure` + `SameSite`.
- [ ] Bloqueo por intentos y rate limiting en login/refresh/recuperación.
- [ ] RBAC de 5 roles con **scoping de datos** por propiedad/equipo; verificación anti-IDOR.
- [ ] RLS en PostgreSQL evaluada/activada para tablas sensibles.
- [ ] TLS 1.2+ con HSTS; cifrado en reposo de BD y storage.
- [ ] URLs firmadas temporales para certificados médicos; sin acceso público.
- [ ] IBAN completo no persistido (solo last4 + `mandate_id`).
- [ ] helmet + CSP + cabeceras de seguridad; validación con **zod** en todos los DTO.
- [ ] Protección CSRF (SameSite + token) en mutaciones.
- [ ] Secretos fuera del repo, por entorno, con plan de rotación.

### Auditoría y brechas
- [ ] `audit_log` registra accesos a datos sensibles y acciones de pago (quién/qué/cuándo/IP).
- [ ] `audit_log` inmutable (solo-append, sin UPDATE/DELETE) y con retención definida.
- [ ] Alertas ante anomalías de acceso configuradas.
- [ ] Plan de notificación de brechas en **72 h** a la AEPD documentado y ensayado.
- [ ] Registro interno de brechas habilitado.
