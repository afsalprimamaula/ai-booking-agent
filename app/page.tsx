'use client';

import { useState } from 'react';

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        // Baca error JSON dari backend untuk pesan yang akurat
        let errorMsg = `Error ${response.status}: Gagal terhubung ke AI`;
        try {
          const errData = await response.json();
          if (errData?.error) errorMsg = errData.error;
        } catch { /* body bukan JSON, pakai pesan default */ }
        throw new Error(errorMsg);
      }

      // Backend mengembalikan plain text, baca dengan .text()
      const replyText = await response.text();
      setMessages([...newMessages, { role: 'assistant', content: replyText }]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal terhubung ke AI';
      console.error('[Chat Error]', msg);
      // Tampilkan error sebagai pesan di chat (lebih baik dari alert)
      setMessages([...newMessages, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 items-center font-sans">
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col relative">

        {/* Header */}
        <div className="bg-blue-600 text-white p-4 font-bold text-center shadow-sm z-10 sticky top-0">
          Smart CS & Booking Klinik
        </div>

        {/* Area Chat */}
        <div className="flex-1 p-4 overflow-y-auto pb-24">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10 p-4 border border-dashed border-gray-300 rounded-lg">
              <p className="font-semibold mb-2">👋 Halo! Saya AI Assistant Klinik.</p>
              <p className="text-sm">Anda bisa menanyakan jadwal operasional, lokasi, harga, atau melakukan reservasi/booking langsung di sini.</p>
            </div>
          )}

          {messages.map((m, index) => (
            <div key={index} className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-3 rounded-lg text-sm ${m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-none'
                }`}>
                {m.content}
              </span>
            </div>
          ))}
          {isLoading && <div className="text-left text-gray-400 text-xs mt-2 italic">AI sedang mengetik...</div>}
        </div>

        {/* Input Form */}
        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              className="flex-1 p-3 border border-gray-300 rounded-lg text-black focus:outline-none focus:border-blue-600"
              value={input}
              placeholder="Ketik pesan Anda..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold disabled:bg-gray-400 transition-colors cursor-pointer"
              disabled={isLoading || !input.trim()}
            >
              Kirim
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}