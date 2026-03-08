

## Problem

The `payfast-checkout` edge function crashes on every call. The logs show:

```
TypeError: Cannot read properties of undefined (reading 'from')
at G (https://esm.sh/js-md5@0.8.3/es2022/js-md5.mjs:3:2347)
```

The `js-md5` npm package imported via `esm.sh` is incompatible with the Deno runtime. Every payment attempt (trial or subscription) fails before reaching PayFast.

## Fix

**One file change:** `supabase/functions/payfast-checkout/index.ts`

Replace the broken `js-md5` import with Deno's built-in `crypto.subtle` API to compute MD5 hashes natively -- zero external dependencies, guaranteed Deno compatibility.

### What changes:
1. Remove `import md5 from "https://esm.sh/js-md5@0.8.3"`
2. Add an inline async MD5 function using `crypto.subtle.digest("MD5", ...)`
3. Update `generatePayFastSignature` to be `async` (and its call site to `await`)

### MD5 replacement:
```typescript
async function md5(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("MD5", data);
  return [...new Uint8Array(hash)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
```

No other files need changes. The client-side code in `BillingPage.tsx`, `UpgradeDialog.tsx`, and `PaywallDialog.tsx` already correctly calls `supabase.functions.invoke("payfast-checkout", ...)` and handles the form submission redirect to PayFast. The only issue is the edge function crashing.

