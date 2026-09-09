import redis from "../db/db.js";
import { verificarSenha } from "../utils/bcryt.js";

export default async function Desbloquear(req, res) {
    const { slug, senha } = req.body;

    if (!slug || !senha) return res.status(400).json({ error: "Slug ou senha não informados" });
    const slugLimpo = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    try {
        const dataString = await redis.get(slugLimpo);

        if (!dataString) {
            return res.status(404).json({ error: "Nota não encontrada" });
        }

        const data = JSON.parse(dataString);

        const senhaValida = await verificarSenha(senha, data.senha);

        if (!senhaValida) {
            return res.status(401).json({ error: "Senha incorreta" });
        }

        return res.status(200).json({
            sucesso: true,
            conteudo: data.conteudo
        });
    } catch (error) {
        console.error("Erro ao desbloquear:", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
}