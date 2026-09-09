import redis from "../db/db.js";
import { gerarHash, verificarSenha } from "../utils/bcryt.js";

const TEMP = 24 * 60 * 60 * 1000;

export default async function CriarESalvar(req, res) {
    const { slug, senha, slugAntigo, senhaOriginal, conteudo } = req.body;

    if (!slug) return res.status(400).json({ error: "Slug não informado" });
    const slugLimpo = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    try {
        let notaAtual = null

        if (slugAntigo && slugAntigo !== slugLimpo) {
            const notaNovaExiste = await redis.exists(slugLimpo);
            if (notaNovaExiste) return res.status(400).json({ error: "Essa URL já está em uso." });

            const notaVelhaString = await redis.get(slugAntigo);
            if (notaVelhaString) {
                notaAtual = JSON.parse(notaVelhaString);
            }
        } else {
            const notaAtualString = await redis.get(slugLimpo);
            if (notaAtualString) {
                notaAtual = JSON.parse(notaAtualString);
            }
        }

        if (notaAtual && notaAtual.senha) {
            const senhaValida = await verificarSenha(senhaOriginal || "", notaAtual.senha);
            if (!senhaValida) {
                return res.status(401).json({ error: "Senha incorreta." });
            }
        }

        const limiteSave = await redis.set(`save-limit:${slugLimpo}`, 1, {
            NX: true,
            EX: 1
        })

        if (limiteSave === null) {
            return res.status(429).json({
                error: "Aguarde um segundo antes de salvar."
            })
        }

        let senhaFinalCriptografada = notaAtual ? notaAtual.senha : "";
        if (senha !== undefined) {
            senhaFinalCriptografada = senha ? await gerarHash(senha) : "";
        }

        const conteudoFinal = conteudo !== undefined ? conteudo : (notaAtual ? notaAtual.conteudo : "");

        const dadosParaSalvar = {
            conteudo: conteudoFinal,
            senha: senhaFinalCriptografada
        };

        await redis.set(slugLimpo, JSON.stringify(dadosParaSalvar), {
            PX: TEMP
        });

        if (slugAntigo && slugAntigo !== slugLimpo) {
            await redis.del(slugAntigo)
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erro no save:", error);
        return res.status(500).json({ error: "Erro ao salvar nota" });
    }
}