import { kv } from "@vercel/kv";

export default async function Save(req, res) {
    if (req.method !== "POST") return res.status(450).end();

    const { slug, conteudo, senha } = req.body;

    if (!slug) return res.status(400).json({ error: "Slug é obrigatório" });
    
    try {
        await kv.set(slug, { conteudo: conteudo, senha: senha || ""});
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: "Erro ao salvar no servidor" });
    }
}