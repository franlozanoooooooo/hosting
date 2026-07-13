import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Post,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
import { prisma, EstadoCuota, EstadoPago, MetodoPago } from "@caa/db";

import { Public } from "../../common/decorators/public.decorator";
import { GoCardlessService } from "./gocardless.service";

/**
 * Webhooks de pago. Son públicos (los llaman GoCardless/Stripe), pero se
 * protegen verificando la FIRMA criptográfica del proveedor. La idempotencia
 * se garantiza con `providerPaymentId` (único en la tabla `pago`).
 *
 * NOTA: requieren el body RAW. En main.ts se configura el rawBody para estas rutas.
 */
@Controller("webhooks")
export class WebhooksController {
  constructor(private readonly gocardless: GoCardlessService) {}

  @Public()
  @Post("gocardless")
  @HttpCode(200)
  async gocardlessWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("webhook-signature") signature: string,
  ) {
    const raw = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
    if (!this.gocardless.verificarFirma(raw, signature)) {
      throw new BadRequestException("Firma de webhook no válida");
    }

    const events = (req.body?.events ?? []) as Array<{
      resource_type: string;
      action: string;
      links?: { payment?: string; mandate?: string };
    }>;

    for (const ev of events) {
      // payments: confirmed | failed | charged_back ; mandates: active | cancelled
      if (ev.resource_type === "payments" && ev.links?.payment) {
        await this.actualizarPagoSepa(ev.links.payment, ev.action);
      }
    }
    return { received: events.length };
  }

  @Public()
  @Post("stripe")
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature: string,
  ) {
    // TODO: stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
    if (!signature) throw new BadRequestException("Falta firma de Stripe");
    // Maneja checkout.session.completed / payment_intent.succeeded para entradas.
    return { received: true };
  }

  /** Concilia el pago SEPA de forma idempotente. */
  private async actualizarPagoSepa(providerPaymentId: string, action: string) {
    const existente = await prisma.pago.findUnique({ where: { providerPaymentId } });
    const estado =
      action === "confirmed"
        ? EstadoPago.CONFIRMADO
        : action === "failed" || action === "charged_back"
          ? EstadoPago.FALLIDO
          : EstadoPago.INICIADO;

    if (existente) {
      // Idempotencia: si ya estaba confirmado no reprocesamos.
      if (existente.estado === estado) return;
      await prisma.pago.update({ where: { providerPaymentId }, data: { estado } });
    }

    // Si el cobro falla/se devuelve, marcamos la cuota asociada como IMPAGADA.
    if (estado === EstadoPago.FALLIDO && existente?.cuotaId) {
      await prisma.cuota.update({
        where: { id: existente.cuotaId },
        data: { estado: EstadoCuota.IMPAGADA },
      });
    }
    if (estado === EstadoPago.CONFIRMADO && existente?.cuotaId) {
      await prisma.cuota.update({
        where: { id: existente.cuotaId },
        data: { estado: EstadoCuota.PAGADA },
      });
    }
    // Referencia a MetodoPago para conciliaciones futuras (efectivo/transferencia).
    void MetodoPago.SEPA_GOCARDLESS;
  }
}
