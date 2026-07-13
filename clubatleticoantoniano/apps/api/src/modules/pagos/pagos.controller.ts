import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ROLES } from "@caa/shared";

import { PagosService } from "./pagos.service";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser, type AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("pagos")
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  /** Cuotas del usuario (FAMILIA: solo las suyas; admin: todas). */
  @Get("cuotas")
  cuotas(@CurrentUser() user: AuthUser) {
    return this.pagosService.listarCuotas(user);
  }

  /** Descarga del recibo PDF de una cuota (URL firmada temporal). */
  @Get("cuotas/:id/recibo")
  recibo(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.pagosService.reciboUrl(id, user);
  }

  /** La familia registra su mandato SEPA (devuelve URL de GoCardless). */
  @Post("mandato")
  @Roles(ROLES.FAMILIA)
  mandato(@Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.pagosService.iniciarMandato(body, user);
  }

  /** La familia confirma el mandato a la vuelta de GoCardless. */
  @Post("mandato/confirmar")
  @Roles(ROLES.FAMILIA)
  confirmarMandato(
    @Body() body: { redirectFlowId?: string },
    @CurrentUser() user: AuthUser,
  ) {
    return this.pagosService.confirmarMandato(body?.redirectFlowId ?? "", user);
  }

  /** Administración crea una cuota. */
  @Post("cuotas")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  crearCuota(@Body() body: unknown) {
    return this.pagosService.crearCuota(body);
  }

  /** Administración genera la remesa mensual (agrupa cuotas pendientes). */
  @Post("remesas")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  generarRemesa(@Body() body: { referencia: string; fechaCobro: string }) {
    return this.pagosService.generarRemesa(body.referencia, new Date(body.fechaCobro));
  }

  /** Administración consulta impagos/devoluciones. */
  @Get("impagos")
  @Roles(ROLES.SUPER_ADMIN, ROLES.ADMIN)
  impagos() {
    return this.pagosService.listarImpagos();
  }
}
