import { kv } from "@vercel/kv";

export default async function Pegar(req, res) {
    const { slug, senha } = req.query;

    if (!slug) {
        return res.status(400).json({ error: "Slug não informado" });
    }

    try {
        const data = await kv.get(slug);

        if (data) {
            return res.status(404).json({ existe: false });
        }

        if (data.senha && data.senha !== senha) {
            return res.status(200).json({ existe: true, protegido: true });
        }

        return res.status(200).json({ existe: true, protegido: false, conteudo: data.conteudo })
    } catch (error) {
        return res.status(500).json({ error: "Erro ao buscar nota no servidor" });
    }
}