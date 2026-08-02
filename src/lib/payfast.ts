/**
 * Shared PayFast redirect helper.
 *
 * PayFast blocks being framed (X-Frame-Options), so submitting the checkout
 * form with target="_self" or "_top" silently fails whenever the app is
 * running inside an iframe (Lovable preview, embedded views, some in-app
 * browsers). In that case we open PayFast in a new tab instead.
 */
export const isInIframe = (): boolean => {
  try {
    return window.top !== window.self;
  } catch {
    return true;
  }
};

export const submitPayFastForm = (
  paymentUrl: string,
  params: Record<string, string>
): void => {
  if (!paymentUrl || !params) {
    throw new Error("PayFast checkout could not be started. Please try again.");
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.target = isInIframe() ? "_blank" : "_self";
  form.rel = "noopener";
  form.style.display = "none";

  Object.entries(params).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  window.setTimeout(() => form.remove(), 1000);
};
