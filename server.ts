import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BREVO_CONFIG_FILE = path.resolve(__dirname, 'brevo-config.json');

function getStoredBrevoConfig(): { apiKey?: string; senderEmail?: string; senderName?: string } {
  try {
    if (fs.existsSync(BREVO_CONFIG_FILE)) {
      const content = fs.readFileSync(BREVO_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn('Could not read brevo-config.json:', err);
  }
  return {};
}

function saveStoredBrevoConfig(config: { apiKey: string; senderEmail: string; senderName: string }) {
  fs.writeFileSync(BREVO_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface OrderPayload {
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  shippingAddress: {
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod: string;
  createdAt: string;
}

function generateReceiptHtml(order: OrderPayload): string {
  const itemsRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="font-weight: 600; color: #0f172a;">${item.name}</div>
          <div style="font-size: 13px; color: #64748b;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Aura Store Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 36px 32px; text-align: center;">
              <span style="display: inline-block; padding: 6px 14px; background: rgba(255,255,255,0.12); border-radius: 20px; color: #a1a1aa; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">Official Order Receipt</span>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.02em;">AURA STORE</h1>
              <p style="margin: 8px 0 0; color: #cbd5e1; font-size: 14px;">Thank you for your purchase, ${order.customerName}!</p>
            </td>
          </tr>
          <!-- Order Meta -->
          <tr>
            <td style="padding: 24px 32px 16px; border-bottom: 1px solid #f1f5f9;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Order Number</div>
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 2px;">#${order.orderId.slice(-8).toUpperCase()}</div>
                  </td>
                  <td style="text-align: right;">
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Order Date</div>
                    <div style="font-size: 14px; color: #334155; margin-top: 2px;">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Items List -->
          <tr>
            <td style="padding: 20px 32px;">
              <h3 style="margin: 0 0 16px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Items Ordered</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsRows}
              </table>
            </td>
          </tr>
          <!-- Summary calculation -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 16px 20px;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">$${order.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 14px;">Shipping</td>
                  <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">${order.shippingFee === 0 ? '<span style="color:#16a34a; font-weight:600;">FREE</span>' : `$${order.shippingFee.toFixed(2)}`}</td>
                </tr>
                ${
                  order.discount > 0
                    ? `<tr>
                        <td style="padding: 4px 0; color: #16a34a; font-size: 14px;">Discount Applied</td>
                        <td style="padding: 4px 0; text-align: right; color: #16a34a; font-size: 14px; font-weight: 600;">-$${order.discount.toFixed(2)}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 12px 0 4px; border-top: 1px solid #e2e8f0; font-size: 16px; font-weight: 700; color: #0f172a;">Total Paid</td>
                  <td style="padding: 12px 0 4px; border-top: 1px solid #e2e8f0; text-align: right; font-size: 18px; font-weight: 800; color: #0f172a;">$${order.total.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Shipping Address -->
          <tr>
            <td style="padding: 0 32px 28px;">
              <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px;">
                <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; font-weight: 700; margin-bottom: 6px;">Shipping Destination</div>
                <div style="font-size: 14px; color: #0f172a; line-height: 1.5;">
                  <strong>${order.customerName}</strong><br>
                  ${order.shippingAddress.address}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.country} ${order.shippingAddress.postalCode}
                </div>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 24px 32px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">Dispatched via Brevo Transactional API • Aura Commerce Engine</p>
              <p style="margin: 6px 0 0;">Need support? Reply to this email or visit our Help Center.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Brevo config check endpoint
app.get(['/api/brevo-status', '/api/mailgun-status'], (_req: Request, res: Response) => {
  const fileConfig = getStoredBrevoConfig();
  const apiKey = process.env.BREVO_API_KEY || fileConfig.apiKey;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || fileConfig.senderEmail || 'ajibademusty@gmail.com';
  const senderName = process.env.BREVO_SENDER_NAME || fileConfig.senderName || 'Aura Store';

  res.json({
    provider: 'brevo',
    configured: Boolean(apiKey),
    senderEmail,
    senderName,
  });
});

// Endpoint to persist Brevo configuration store-wide for all visitors & instructors
app.post('/api/save-brevo-config', (req: Request, res: Response) => {
  try {
    const { apiKey, senderEmail, senderName } = req.body;
    if (!apiKey || !senderEmail) {
      return res.status(400).json({ error: 'API key and verified sender email are required' });
    }
    saveStoredBrevoConfig({
      apiKey: String(apiKey).trim(),
      senderEmail: String(senderEmail).trim(),
      senderName: String(senderName || 'Aura Store').trim(),
    });
    console.log('Brevo configuration saved permanently for this store.');
    return res.json({
      success: true,
      message: 'Brevo configuration permanently saved for this store! All checkout orders will now dispatch real emails.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to save configuration';
    return res.status(500).json({ error: msg });
  }
});

// Confirmation email sender using Brevo API (or simulation if key unset)
app.post('/api/send-confirmation-email', async (req: Request, res: Response) => {
  try {
    const { order, customApiKey, customSenderEmail, customSenderName } = req.body as {
      order: OrderPayload;
      customApiKey?: string;
      customSenderEmail?: string;
      customSenderName?: string;
    };

    if (!order || !order.customerEmail || !order.orderId) {
      return res.status(400).json({ error: 'Missing order details or customer email' });
    }

    const fileConfig = getStoredBrevoConfig();
    const apiKey = customApiKey?.trim() || process.env.BREVO_API_KEY?.trim() || fileConfig.apiKey?.trim();
    const senderEmail = customSenderEmail?.trim() || process.env.BREVO_SENDER_EMAIL?.trim() || fileConfig.senderEmail?.trim() || 'ajibademusty@gmail.com';
    const senderName = customSenderName?.trim() || process.env.BREVO_SENDER_NAME?.trim() || fileConfig.senderName?.trim() || 'Aura Store';

    const htmlContent = generateReceiptHtml(order);
    const subject = `Order Confirmation #${order.orderId.slice(-8).toUpperCase()} - Aura Store`;
    const textContent = `Thank you for your order #${order.orderId.slice(-8).toUpperCase()}, ${order.customerName}! Total paid: $${order.total.toFixed(2)}.`;

    // If Brevo API key is provided, invoke live Brevo v3 Transactional Email endpoint
    if (apiKey) {
      try {
        const brevoPayload = {
          sender: {
            name: senderName,
            email: senderEmail,
          },
          to: [
            {
              email: order.customerEmail,
              name: order.customerName,
            },
          ],
          subject,
          htmlContent,
          textContent,
        };

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify(brevoPayload),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Brevo API Error:', data);
          const isIpBlock = data.message && data.message.includes('unrecognised IP address');
          return res.status(response.status).json({
            success: false,
            provider: 'brevo',
            error: data.message || 'Failed to dispatch email via Brevo',
            isIpRestricted: Boolean(isIpBlock),
            detectedIp: '34.34.246.78',
            mode: 'live_failed',
            htmlPreview: htmlContent,
          });
        }

        return res.json({
          success: true,
          provider: 'brevo',
          mode: 'live',
          messageId: data.messageId || `<${Date.now()}@smtp-relay.brevo.com>`,
          message: 'Email successfully queued and sent via Brevo API',
          recipient: order.customerEmail,
          htmlPreview: htmlContent,
        });
      } catch (networkErr: unknown) {
        console.error('Network error contacting Brevo API:', networkErr);
        return res.status(500).json({
          success: false,
          provider: 'brevo',
          error: networkErr instanceof Error ? networkErr.message : 'Network error reaching Brevo API',
          mode: 'live_failed',
          htmlPreview: htmlContent,
        });
      }
    }

    // High-Fidelity Simulation & Preview mode (when Brevo API key is not yet set)
    const simulatedMessageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@smtp-relay.brevo.com>`;

    return res.json({
      success: true,
      provider: 'brevo',
      mode: 'simulated',
      messageId: simulatedMessageId,
      message: 'Email confirmation rendered and simulated (Brevo API key not configured yet). You can preview the exact HTML receipt below or enter your Brevo API key in settings.',
      recipient: order.customerEmail,
      subject,
      from: `${senderName} <${senderEmail}>`,
      htmlPreview: htmlContent,
    });
  } catch (err: unknown) {
    console.error('Error processing email dispatch:', err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Server error dispatching email',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
