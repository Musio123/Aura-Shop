import React, { useState, useEffect } from 'react';
import { X, Mail, Send, CheckCircle, AlertCircle, Key, Globe, Shield, RefreshCw, Info } from 'lucide-react';
import { BrevoSettings } from '../services/storeService';

interface BrevoModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BrevoSettings;
  onSaveSettings: (settings: BrevoSettings) => void;
}

export const BrevoModal: React.FC<BrevoModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [senderEmail, setSenderEmail] = useState(settings.senderEmail || 'ajibademusty@gmail.com');
  const [senderName, setSenderName] = useState(settings.senderName || 'Aura Store');
  const [serverStatus, setServerStatus] = useState<{ configured: boolean; senderEmail: string } | null>(null);

  const [testRecipient, setTestRecipient] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    isIpRestricted?: boolean;
    mode?: string;
    messageId?: string;
    htmlPreview?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Check server status
      fetch('/api/brevo-status')
        .then((r) => r.json())
        .then((data) => setServerStatus(data))
        .catch(() => setServerStatus(null));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/save-brevo-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          senderEmail: senderEmail.trim(),
          senderName: senderName.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onSaveSettings({
          apiKey: apiKey.trim(),
          senderEmail: senderEmail.trim(),
          senderName: senderName.trim(),
        });
        setServerStatus({
          configured: true,
          senderEmail: senderEmail.trim(),
        });
        alert('Brevo settings saved globally! All instructors and customers checking out will now receive real confirmation emails.');
      } else {
        alert(data.error || 'Failed to save Brevo settings on server');
      }
    } catch (err: unknown) {
      alert('Error saving Brevo settings: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleSendTestPing = async () => {
    if (!testRecipient) {
      alert('Please enter a recipient email address.');
      return;
    }
    setTestSending(true);
    setTestResult(null);

    try {
      const mockOrder = {
        orderId: `BREVO-${Date.now().toString(36).toUpperCase()}`,
        customerName: 'Brevo Evaluator',
        customerEmail: testRecipient,
        items: [
          {
            id: 'test-1',
            name: 'Aura Studio Living - Test Item',
            price: 135.0,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80',
          },
        ],
        subtotal: 135.0,
        shippingFee: 0,
        discount: 0,
        total: 135.0,
        shippingAddress: {
          address: '104 Mercer St',
          city: 'New York',
          country: 'United States',
          postalCode: '10012',
        },
        paymentMethod: 'Test Verification Card',
        createdAt: new Date().toISOString(),
      };

      const res = await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: mockOrder,
          customApiKey: apiKey.trim() || undefined,
          customSenderEmail: senderEmail.trim() || undefined,
          customSenderName: senderName.trim() || undefined,
        }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || data.error || (data.success ? 'Email dispatched via Brevo' : 'Error dispatching email'),
        isIpRestricted: Boolean(data.isIpRestricted || (data.error && data.error.includes('unrecognised IP address'))),
        mode: data.mode,
        messageId: data.messageId,
        htmlPreview: data.htmlPreview,
      });
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network failure',
      });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 text-zinc-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Brevo Email Integration & Verification</h2>
            <p className="text-xs text-zinc-400">
              Transactional email dispatch via Brevo (formerly Sendinblue) REST API v3.
            </p>
          </div>
        </div>

        {/* Status banner */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 mb-6 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Brevo Status:</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                apiKey || serverStatus?.configured ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {apiKey || serverStatus?.configured ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  Live Brevo Key Active
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  High-Fidelity Preview Mode (Enter key below for live dispatch)
                </>
              )}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Brevo allows 300 free emails per day without credit card. Simply create an API key in your Brevo account (under <em>SMTP & API &rarr; API Keys</em>) and ensure your Sender Email is verified.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-400" />
            Brevo API Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Brevo API Key (starts with <code className="text-amber-400">xkeysib-...</code>)
              </label>
              <input
                type="password"
                placeholder="xkeysib-0123456789abcdef..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Verified Sender Email</label>
                <input
                  type="email"
                  placeholder="e.g. ajibademusty@gmail.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  The email you registered on Brevo with. Brevo only sends emails from your registered account email.
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Sender Display Name</label>
                <input
                  type="text"
                  placeholder="Aura Store"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  The company or store name displayed at the top of the email in the instructor's inbox.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold rounded-xl text-xs transition-colors"
          >
            Save Brevo Credentials
          </button>
        </form>

        {/* Live Test Sender */}
        <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-amber-400" />
            Send Test Confirmation Email
          </h3>
          <p className="text-[11px] text-zinc-400">
            Enter your email to test receiving the generated Brevo HTML order receipt.
          </p>

          <div className="flex gap-2 text-xs">
            <input
              type="email"
              placeholder="your-email@example.com"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleSendTestPing}
              disabled={testSending}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {testSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Test'
              )}
            </button>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-red-950/40 border-red-800 text-red-200'
              }`}
            >
              <div className="font-semibold flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {testResult.success ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{testResult.success ? 'Brevo Dispatched Successfully!' : 'Brevo Blocked Request (Action Required)'}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40 border border-current">
                  {testResult.mode || 'info'}
                </span>
              </div>
              
              <p className="text-[11px] text-zinc-300 leading-relaxed">{testResult.message}</p>

              {testResult.isIpRestricted && (
                <div className="mt-2 p-3 bg-zinc-950 rounded-lg border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Brevo IP Security Whitelist:
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Brevo requires cloud servers to be authorized before sending emails.
                  </p>
                  <div className="bg-zinc-900 p-2 rounded border border-zinc-800 font-mono text-zinc-200 flex items-center justify-between">
                    <span>IP Address: <strong>34.34.246.78</strong></span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText('34.34.246.78')}
                      className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-amber-300"
                    >
                      Copy IP
                    </button>
                  </div>
                  <div className="pt-1 flex flex-col gap-1.5 text-[11px]">
                    <a
                      href="https://app.brevo.com/security/authorised_ips"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-colors"
                    >
                      <span>Authorize IP in Brevo Settings &rarr;</span>
                    </a>
                    <span className="text-[10px] text-zinc-400 text-center">
                      Tip: In that page, you can also toggle OFF <em>"Blocking of unknown IP addresses"</em> so cloud servers are never blocked.
                    </span>
                  </div>
                </div>
              )}

              {testResult.messageId && (
                <p className="text-[10px] font-mono text-zinc-400">Message-ID: {testResult.messageId}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
