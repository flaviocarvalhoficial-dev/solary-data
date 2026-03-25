import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function hmacSha256(key: string, data: string) {
    const encoder = new TextEncoder();
    const keyBuf = encoder.encode(key);
    const dataBuf = encoder.encode(data);
    const cryptoKey = await crypto.subtle.importKey(
        "raw", keyBuf, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, dataBuf);
    return encode(sigBuf);
}

function normalizePath(path: string): string {
    return path.replace(/\/{2,}/g, "/").replace(/\/$/, "");
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const body = await req.json();
        const { action, system_id, page = 1, size = 100 } = body;

        const appId = Deno.env.get('APSYSTEMS_APP_ID')?.trim().replace(/"/g, "") || '';
        const appSecret = Deno.env.get('APSYSTEMS_APP_SECRET')?.trim().replace(/"/g, "") || '';

        if (!appId || !appSecret) throw new Error("Credentials missing in environment variables.");

        let rawPath = "";
        let method = "GET";

        if (action === 'list') {
            rawPath = "/installer/api/v2/systems";
            method = "POST";
        } else if (action === 'stats') {
            rawPath = `/installer/api/v2/systems/summary/${system_id}`;
            method = "GET";
        } else if (action === 'details') {
            rawPath = `/installer/api/v2/systems/details/${system_id}`;
            method = "GET";
        }

        // Normalização Oficial: O RequestPath na assinatura é apenas o ÚLTIMO segmento da URL
        const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
        // Exemplo: /installer/api/v2/systems -> systems
        const requestPathForSignature = (path.split('/').filter(Boolean).pop() || '').trim();

        const timestamp = Date.now().toString().trim();
        const nonce = crypto.randomUUID().replace(/-/g, "").trim();
        const signatureMethod = "HmacSHA256".trim();
        const appIdClean = appId.trim();

        // Formato: timestamp/nonce/appId/requestPath/method/signatureMethod
        const stringToSign = [timestamp, nonce, appIdClean, requestPathForSignature, method.trim(), signatureMethod].join('/');
        const signature = await hmacSha256(appSecret.trim(), stringToSign);

        const baseUrl = 'https://api.apsystemsema.com:9282';
        const finalUrl = `${baseUrl}${path}`;

        const headers = {
            "X-CA-AppId": appId,
            "X-CA-Key": appId,
            "X-CA-Timestamp": timestamp,
            "X-CA-Nonce": nonce,
            "X-CA-Signature-Method": signatureMethod,
            "X-CA-Signature": signature,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };

        const response = await fetch(finalUrl, {
            method,
            headers,
            body: method === "POST" ? JSON.stringify({ page, size }) : undefined,
        });

        const data = await response.json();

        return new Response(JSON.stringify({
            success: true,
            data,
            audit: {
                "[SIGNATURE DEBUG]": {
                    timestamp,
                    nonce,
                    appId: appIdClean,
                    requestPath: requestPathForSignature,
                    method: method.trim(),
                    stringToSign,
                    signatureBase64: signature
                },
                action,
                path,
                receivedParams: { page, size, system_id }
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        return new Response(JSON.stringify({
            success: false,
            error: err.message,
            audit: { error: true, msg: err.message }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
