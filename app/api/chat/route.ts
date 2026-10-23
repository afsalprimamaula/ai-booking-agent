import { OpenAI } from 'openai';

const groq = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const systemPrompt = {
            role: 'system',
            content: `Anda adalah AI Customer Support dan Booking Agent untuk sebuah Klinik Profesional.
      Aturan Anda:
      1. Anda harus selalu ramah, to-the-point, dan menggunakan bahasa Indonesia yang baik.
      2. Jika pengguna bertanya FAQ, gunakan data ini: Jam operasional Senin-Jumat (09:00-17:00). Lokasi di Jl. Sudirman No. 123, Jakarta. Harga konsultasi Rp 250.000/sesi.
      3. Jika pengguna ingin memesan/booking jadwal, tanyakan kelengkapan data ini satu per satu: Nama, Email, Tanggal Reservasi, dan Jenis Keluhan.
      4. Jawablah sesingkat mungkin, jangan berikan paragraf yang terlalu panjang.`
        };

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [systemPrompt, ...messages],
        });

        const reply = completion.choices[0]?.message?.content || 'Maaf, terjadi kesalahan.';

        return new Response(reply, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error: unknown) {
        // Log detail error ke terminal Next.js agar mudah di-debug
        if (error instanceof Error) {
            console.error('[Groq API Error]', error.message);
            // OpenAI SDK v7 error kadang punya property `status` dan `error`
            const apiErr = error as Error & { status?: number; error?: unknown };
            if (apiErr.status) console.error('[Status]', apiErr.status);
            if (apiErr.error) console.error('[Detail]', JSON.stringify(apiErr.error, null, 2));
        } else {
            console.error('[Unknown Error]', error);
        }
        return new Response(
            JSON.stringify({ error: 'Gagal memproses AI' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}