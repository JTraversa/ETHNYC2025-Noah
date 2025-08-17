export const FERN_API_BASE = process.env.REACT_APP_FERN_API_BASE || "";

export async function createCustomer({ name }) {
  if (!FERN_API_BASE) {
    // eslint-disable-next-line no-console
    console.warn("[Fern] API base not set; returning mock customer");
    return { customerId: `mock_customer_${Date.now()}` };
  }
  const res = await fetch(`${FERN_API_BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Fern createCustomer failed: ${res.status}`);
  const data = await res.json();
  return { customerId: data.customerId };
}

export async function createPaymentAccount({ customerId, nickname }) {
  if (!FERN_API_BASE) {
    // eslint-disable-next-line no-console
    console.warn("[Fern] API base not set; returning mock payment account");
    return { paymentAccountId: `mock_payacct_${Date.now()}` };
  }
  const res = await fetch(`${FERN_API_BASE}/payment-accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customerId, nickname }),
  });
  if (!res.ok) throw new Error(`Fern createPaymentAccount failed: ${res.status}`);
  const data = await res.json();
  return { paymentAccountId: data.paymentAccountId };
}

export async function generateOfframpQuote({
  customerId,
  destinationPaymentAccountId,
  sourceCurrency,
  sourcePaymentMethod,
  sourceAmount,
  destinationCurrency,
}) {
  if (!FERN_API_BASE) {
    // eslint-disable-next-line no-console
    console.warn("[Fern] API base not set; returning mock quote");
    const mockRate = 0.999; // pretend minor fee/FX
    const amountNum = Number(sourceAmount || 0);
    const destAmount = Math.max(0, amountNum * mockRate);
    return {
      quoteId: `mock_quote_${Date.now()}`,
      rate: mockRate,
      fees: 0.1 * amountNum * (1 - mockRate),
      destinationAmount: destAmount,
      summary: `Off-ramp ${amountNum} ${sourceCurrency} → ~${destAmount.toFixed(2)} ${destinationCurrency}`,
    };
  }
  const res = await fetch(`${FERN_API_BASE}/quotes/offramp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      customerId,
      destinationPaymentAccountId,
      source: {
        sourceCurrency,
        sourcePaymentMethod,
        sourceAmount,
      },
      destination: {
        destinationPaymentAccountId,
        destinationCurrency,
      },
    }),
  });
  if (!res.ok) throw new Error(`Fern quote failed: ${res.status}`);
  const data = await res.json();
  return data;
}


