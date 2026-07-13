import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHmac, timingSafeEqual } from "node:crypto";
import gocardless, { Environments, type GoCardlessClient } from "gocardless-nodejs";

/**
 * Cliente de GoCardless para domiciliación SEPA recurrente.
 *
 * Dos modos según GOCARDLESS_ACCESS_TOKEN:
 *  - REAL (sandbox o live según GOCARDLESS_ENVIRONMENT): SDK oficial. El tutor
 *    autoriza el mandato en la página segura de GoCardless (el IBAN nunca pasa
 *    por nuestros servidores) y los cobros se presentan al sistema bancario.
 *  - SIMULADO (sin token): mismas firmas y estados, identificadores `_sim_`,
 *    sin salir a la página de GoCardless. Permite desarrollar y demostrar la
 *    plataforma completa sin credenciales.
 *
 * Ver docs/04-pagos.md para el flujo completo (redirect flow → mandato → cobro).
 */
@Injectable()
export class GoCardlessService {
  private readonly logger = new Logger(GoCardlessService.name);
  private client: GoCardlessClient | null = null;

  constructor(private readonly config: ConfigService) {
    const token = this.config.get<string>("GOCARDLESS_ACCESS_TOKEN");
    if (token) {
      const env =
        this.config.get<string>("GOCARDLESS_ENVIRONMENT") === "live"
          ? Environments.Live
          : Environments.Sandbox;
      this.client = gocardless(token, env);
      this.logger.log(`GoCardless en modo REAL (${env}).`);
    } else {
      this.logger.warn("GOCARDLESS_ACCESS_TOKEN no configurado: modo SIMULADO.");
    }
  }

  /** true si operamos contra GoCardless de verdad (sandbox/live). */
  get esReal(): boolean {
    return this.client !== null;
  }

  /**
   * El session token liga la creación y la confirmación de un redirect flow.
   * Lo derivamos del tutor: estable, único y sin estado adicional en BD.
   */
  private sessionToken(tutorId: string): string {
    return `caa_sess_${tutorId}`;
  }

  /**
   * Inicia un "redirect flow": devuelve la URL a la que enviar al tutor para
   * que autorice el mandato SEPA en el entorno seguro de GoCardless.
   */
  async crearRedirectFlow(params: {
    tutorId: string;
    titular: string;
    successUrl: string;
  }): Promise<{ redirectFlowId: string; redirectUrl: string; esReal: boolean }> {
    if (!this.client) {
      const id = `RE_sim_${params.tutorId}_${Date.now()}`;
      return {
        redirectFlowId: id,
        redirectUrl: `${params.successUrl}?redirect_flow_id=${id}`,
        esReal: false,
      };
    }

    const flow = await this.client.redirectFlows.create({
      session_token: this.sessionToken(params.tutorId),
      success_redirect_url: params.successUrl,
      description: "Cuota de cantera · Club Atlético Antoniano",
      prefilled_customer: { given_name: params.titular },
    });
    return {
      redirectFlowId: flow.id!,
      redirectUrl: flow.redirect_url!,
      esReal: true,
    };
  }

  /**
   * Completa el redirect flow tras la vuelta del tutor: confirma el mandato
   * en GoCardless y devuelve su id y los últimos 4 dígitos de la cuenta.
   */
  async completarRedirectFlow(
    redirectFlowId: string,
    tutorId: string,
  ): Promise<{ mandateId: string; ibanLast4: string | null }> {
    if (!this.client || redirectFlowId.startsWith("RE_sim_")) {
      return { mandateId: `MD_sim_${redirectFlowId.slice(-12)}`, ibanLast4: null };
    }

    const completed = await this.client.redirectFlows.complete(redirectFlowId, {
      session_token: this.sessionToken(tutorId),
    });
    const mandateId = completed.links!.mandate!;

    // Últimos 4 dígitos reales de la cuenta (los custodia GoCardless).
    let ibanLast4: string | null = null;
    const bankAccountId = completed.links?.customer_bank_account;
    if (bankAccountId) {
      const cuenta = await this.client.customerBankAccounts.find(bankAccountId);
      ibanLast4 = cuenta.account_number_ending ?? null;
    }
    return { mandateId, ibanLast4 };
  }

  /** Crea un cobro contra un mandato activo (una cuota de la remesa). */
  async crearCobro(params: {
    mandateId: string;
    importeCentimos: number;
    descripcion: string;
    idempotencyKey: string;
  }): Promise<{ paymentId: string }> {
    if (!this.client || params.mandateId.startsWith("MD_sim_")) {
      return { paymentId: `PM_sim_${params.idempotencyKey}` };
    }

    const payment = await this.client.payments.create(
      {
        amount: String(params.importeCentimos),
        currency: "EUR" as never,
        description: params.descripcion,
        links: { mandate: params.mandateId },
      },
      params.idempotencyKey,
    );
    return { paymentId: payment.id! };
  }

  /**
   * Verifica la firma HMAC-SHA256 del webhook (cabecera `Webhook-Signature`)
   * sobre el cuerpo crudo, en tiempo constante.
   */
  verificarFirma(rawBody: Buffer, signature: string): boolean {
    const secret = this.config.get<string>("GOCARDLESS_WEBHOOK_SECRET");
    if (!secret || !signature) return false;
    const esperado = createHmac("sha256", secret).update(rawBody).digest("hex");
    if (esperado.length !== signature.length) return false;
    return timingSafeEqual(Buffer.from(esperado), Buffer.from(signature));
  }
}
