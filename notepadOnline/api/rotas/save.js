import redis from "../db/db.js";
import { gerarHash, verificarSenha } from "../utils/bcryt.js";

const TEMP = 24 * 60 * 60 * 1000;

export default async function CriarESalvar(req, res) {
    const { slug, conteudo, slugAntigo, senha, novaSenha } = req.body;

    if (!slug) return res.status(400).json({ error: "Slug não informado" });

    const slugLimpo = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    const slugAntigoLimpo = slugAntigo ? slugAntigo.toLowerCase().trim().replace(/[^a-z0-9-]/g, "") : null;

    try {
        let notaAtual = null;
        const mudandoUrl = slugAntigoLimpo && slugAntigoLimpo !== slugLimpo;

        const chaveBusca = mudandoUrl ? slugAntigoLimpo : slugLimpo;
        const notaString = await redis.get(chaveBusca);

        if (notaString) {
            notaAtual = JSON.parse(notaString);
        } else if (mudandoUrl) {
            return res.status(404).json({ error: "Nota antiga não encontrada." });
        }

        if (mudandoUrl) {
            const notaNovaExiste = await redis.exists(slugLimpo);

            if (notaNovaExiste) {
                return res.status(400).json({ error: "Essa URL já está em uso." });
            }
        }

        if (notaAtual && notaAtual.senha) {
            const senhaValida = await verificarSenha(senha || "", notaAtual.senha);

            if (!senhaValida) {
                return res.status(401).json({ error: "Senha incorreta." });
            }
        }

        const limiteSave = await redis.set(`save-limit:${slugLimpo}`, 1, {
            NX: true,
            EX: 1
        });

        if (limiteSave === null) {
            return res.status(429).json({ error: "Aguarde um segundo antes de salvar." });
        }

        let senhaFinalCriptografada = notaAtual ? notaAtual.senha : "";
        
        if (novaSenha !== undefined) {
            senhaFinalCriptografada = senha ? await gerarHash(novaSenha) : "";
        }

        const conteudoFinal = conteudo !== undefined ? conteudo : (notaAtual ? notaAtual.conteudo : "");

        const dadosParaSalvar = {
            conteudo: conteudoFinal,
            senha: senhaFinalCriptografada,
            protegido: !!senhaFinalCriptografada
        };

        if (mudandoUrl) {
            await redis.rename(slugAntigoLimpo, slugLimpo);
        }

        await redis.set(slugLimpo, JSON.stringify(dadosParaSalvar), {
            PX: TEMP
        });

        return res.status(200).json({ success: true, slug: slugLimpo });
    } catch (error) {
        console.error("Erro no save:", error);
        return res.status(500).json({ error: "Erro ao salvar" });
    }
}