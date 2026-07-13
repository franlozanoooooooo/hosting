import { Body, Controller, Post } from "@nestjs/common";
import { ROLES } from "@caa/shared";

import { ClaudeService, type DatosPartido } from "./claude.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";

@Controller("ia")
export class IaController {
  constructor(private readonly claude: ClaudeService) {}

  /** 1) Genera una crónica/noticia a partir del resultado (admin/coordinador). */
  @Post("cronica")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINADOR)
  cronica(@Body() body: DatosPartido) {
    return this.claude.generarCronica(body);
  }

  /** 2) Redacta una comunicación a las familias (admin/coordinador/entrenador). */
  @Post("comunicacion")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINADOR, ROLES.ENTRENADOR)
  comunicacion(
    @Body()
    body: {
      tipo: "aviso" | "convocatoria" | "circular";
      notas: string;
      equipo?: string;
      urgente?: boolean;
    },
  ) {
    return this.claude
      .redactarComunicacion(body)
      .then((texto) => ({ texto }));
  }

  /** 3) Chatbot de FAQ — público (formulario de contacto/captación). */
  @Public()
  @Post("faq")
  faq(@Body() body: { pregunta: string }) {
    return this.claude.responderFaq(body.pregunta).then((respuesta) => ({ respuesta }));
  }

  /** 4) Resume/extrae datos de un PDF en base64 (admin/coordinador). */
  @Post("documento/resumen")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.COORDINADOR)
  resumirDocumento(@Body() body: { pdfBase64: string; instruccion?: string }) {
    return this.claude
      .resumirDocumentoPdf(body.pdfBase64, body.instruccion)
      .then((resumen) => ({ resumen }));
  }
}
