import redis from "../db/db.js";

export default async function PegarBloco(req, res) {
    const { slug } = req.query;

    if (!slug) return res.status(400).json({ error: "Slug não informado" });
    const slugLimpo = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    try {
        const dataString = await redis.get(slugLimpo);

        if (!dataString) {
            return res.status(404).json({ existe: false });
        }

        const data = JSON.parse(dataString);
        const temSenhaNoBanco = Boolean(data.senha);

        if (temSenhaNoBanco) {
            return res.status(200).json({ existe: true, protegido: true });
        }

        return res.status(200).json({
            existe: true,
            protegido: false,
            conteudo: data.conteudo
        });
    } catch (error) {
        console.error("Erro ao pegar:", error);
        return res.status(500).json({ error: "Erro ao buscar nota no servidor" });
    }
}