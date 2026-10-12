import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, Mail, ExternalLink, RefreshCw } from 'lucide-react';
import { Order } from '../types/store';
import { fetchUserOrders } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchUserOrders(currentUser?.uid || 'guest')
        .then((data) => setOrders(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 text-zinc-100 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Orders History</h2>
              <p className="text-xs text-zinc-400">
                Synchronized with Cloud Firestore database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs">Loading orders from Firestore...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <Package className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-sm font-medium text-zinc-400">No orders placed yet.</p>
              <p className="text-xs text-zinc-600">
                Complete a purchase through the checkout page to view its persistent database record and confirmation receipt here.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3.5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-3">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                      Order ID
                    </span>
                    <div className="font-mono text-sm font-bold text-white">
                      #{ord.id.slice(-8).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {ord.status}
                    </span>
                    <span className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Mail className="w-3 h-3 text-amber-400" />
                      {ord.emailStatus === 'sent' ? 'Brevo Sent' : 'Simulated'}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover bg-zinc-900"
                        />
                        <span className="text-zinc-200">
                          {item.name} <strong className="text-zinc-500">×{item.quantity}</strong>
                        </span>
                      </div>
                      <span className="font-medium text-zinc-300">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer of card */}
                <div className="pt-3 border-t border-zinc-900 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-zinc-500 text-[11px]">Total: </span>
                      <span className="text-sm font-bold text-amber-400">
                        ${ord.total.toFixed(2)}
                      </span>
                    </div>

                    {ord.emailPreviewHtml && (
                      <button
                        onClick={() => setSelectedReceipt(ord.emailPreviewHtml || null)}
                        className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-amber-300 text-xs flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Receipt Preview Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                <span className="text-xs font-semibold text-zinc-200">Mailgun HTML Email Receipt</span>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-xs bg-zinc-800 text-zinc-300 hover:text-white px-3 py-1 rounded-lg"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-zinc-100">
                <iframe
                  title="Receipt Preview"
                  srcDoc={selectedReceipt}
                  className="w-full h-[500px] border-0 rounded-xl bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
