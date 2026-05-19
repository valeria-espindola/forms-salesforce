import {
  FlowRequestError,
  createDonationChain,
  findOrCreateContact,
  type AltaPersonal,
} from "~/server/utils/salesforce";
import type { DebiPaymentToken } from "~/composables/useDebiClient";

/**
 * Server endpoint for the "alta-donante" flow.
 *
 * Acepta dos stages:
 *
 *   `stage: "personal"` (después del paso 1)
 *     Crea o matchea un Contact por email. Devuelve `{ contactId }`.
 *     Este es el write anti-abandono — aunque el donante nunca llegue
 *     al paso de pago, la org conserva el registro del Contact.
 *
 *   `stage: "finalize"` (después del paso 2 / submit final)
 *     Tokeniza el método de pago (ya hecho client-side), luego crea
 *     la cadena de donación: Payment Method → Recurring Donation
 *     opcional → Opportunity. El Contact ya debe existir (su ID viene
 *     del paso 1).
 *
 * Si tu alta solo necesita un submit (sin write por paso), quitá el
 * branch `stage: "personal"` y llamá a `findOrCreateContact` desde
 * `finalize`. El hook `onStepAdvance` del orquestador es opcional.
 */

type PersonalBody = {
  stage: "personal";
  personal: AltaPersonal;
  campaign?: string | null;
};

type FinalizeBody = {
  stage: "finalize";
  contactId: string;
  amount: number;
  frequency: string;
  paymentMethodToken: DebiPaymentToken;
  dni?: string;
  alreadyDonor?: string;
  campaign?: string | null;
};

type AltaBody = PersonalBody | FinalizeBody;

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<AltaBody>(event);

    if (body.stage === "personal") {
      const p = body.personal;
      if (!p?.firstName || !p.lastName || !p.email) {
        setResponseStatus(event, 400);
        return {
          error: true,
          message: "Faltan datos personales obligatorios.",
        };
      }
      const { contactId } = await findOrCreateContact({
        personal: p,
        extra: body.campaign
          ? { TCPagos__Campa_a__c: body.campaign } as Record<string, string>
          : undefined,
      });
      return { error: false, data: { contactId } };
    }

    if (body.stage === "finalize") {
      if (!body.contactId) {
        setResponseStatus(event, 400);
        return { error: true, message: "Falta el contacto del donante." };
      }
      if (
        typeof body.amount !== "number" ||
        Number.isNaN(body.amount) ||
        body.amount <= 0
      ) {
        setResponseStatus(event, 400);
        return {
          error: true,
          message: "El monto tiene que ser un número positivo.",
        };
      }
      if (
        !body.paymentMethodToken?.id ||
        !body.paymentMethodToken?.type
      ) {
        setResponseStatus(event, 400);
        return {
          error: true,
          message: "El token de método de pago no es válido.",
        };
      }

      // Campos extra: escribimos DNI + "alreadyDonor" en la Opportunity.
      // Si los querés en el Contact, mové esto a `extra.contact` y ajustá
      // `findOrCreateContact` para actualizar un Contact existente.
      const oppExtra: Record<string, string | number | null> = {};
      if (body.dni) {
        oppExtra["TCPagos__N_mero_de_identificaci_n__c"] = body.dni;
      }
      if (body.alreadyDonor) {
        oppExtra["Observaciones__c"] = `¿Ya sos donante?: ${body.alreadyDonor}`;
      }

      const result = await createDonationChain({
        contactId: body.contactId,
        amount: body.amount,
        frequency: body.frequency,
        paymentMethodToken: body.paymentMethodToken,
        campaign: body.campaign ?? null,
        extra: { opportunity: oppExtra },
      });

      return { error: false, data: result };
    }

    setResponseStatus(event, 400);
    return { error: true, message: "Stage desconocido." };
  } catch (error) {
    if (error instanceof FlowRequestError) {
      setResponseStatus(event, error.status);
      return { error: true, message: error.message };
    }
    const message =
      error instanceof Error
        ? error.message
        : "Error desconocido al procesar el alta.";
    setResponseStatus(event, 422);
    return { error: true, message };
  }
});
