import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Notepad() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [text, setText] = useState("");
    const [novaUrl, setNovaUrl] = useState(slug);
    const [senha, setSenha] = useState("");
    const [existe, setExiste] = useState(true);
    const [bloqueadoPorSenha, setBloqueadoPorSenha] = useState(false);
    const [senhaDigitada, setSenhaDigitada] = useState("");

    // CARREGAR NOTA DO BANCO
    useEffect(() => {
        async function carregarNota() {
            try {
                const res = await fetch(`/api/get?slug=${slug}`);
                const data = await res.json();

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    console.warn("Rota /api indisponível ou rodando apenas no Vite sem Vercel CLI.");
                    return;
                }

                if (res.status === 404 || !data.existe) {
                    setExiste(false);
                } else {
                    setExiste(true);

                    if (data.protegido) {
                        setBloqueadoPorSenha(true);
                    } else {
                        setText(data.content || "");
                        setBloqueadoPorSenha(false);
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar:", err);
            }
        }

        carregarNota();
        setNovaUrl(slug);
    }, [slug]);

    // SALVAR TEXTO NO BANCO
    const handleDigitacao = async (e) => {
        const novoTexto = e.target.value;
        setText(novoTexto);

        try {
            await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: slug, conteudo: novoTexto, senha })
            });
        } catch (err) {
            console.error("Erro ao salvar:", err);
        }
    };

    // MUDAR A URL (Renomear/Mover Nota)
    const handleMudarUrl = async () => {
        const urlLimpa = novaUrl.trim().replace(/\s+/g, "-").toLowerCase();

        if (urlLimpa && urlLimpa !== slug) {
            try {
                // Copia o conteúdo atual para o novo slug no banco
                await fetch("/api/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug: urlLimpa, conteudo: text, senha })
                });

                // Redireciona para o novo link
                navigate(`/${urlLimpa}`);
            } catch (err) {
                alert("Erro ao mudar a URL");
            }
        }
    };

    // VERIFICAR SENHA
    const handleDesbloquear = async () => {
        try {
            const res = await fetch(`/api/get?slug=${slug}&senha=${senhaDigitada}`);
            const data = await res.json();

            if (res.ok && data.content !== undefined) {
                setText(data.content);
                setBloqueadoPorSenha(false);
            } else {
                alert("Senha incorreta!");
            }
        } catch (err) {
            alert("Erro ao validar senha");
        }
    };

    const handleCompartilhar = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado: " + window.location.href);
    };

    if (!existe) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Não encontrada</h1>
            </div>
        )
    }

    if (bloqueadoPorSenha) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Esta nota é protegida por senha</h1>

                <div className="flex border border-gray-400 rounded overflow-hidden bg-white">
                    <input type="password" value={senhaDigitada} onChange={(e) => setSenhaDigitada(e.target.value)} className="p-2 outline-none" placeholder="Digite a senha" />

                    <button onClick={handleDesbloquear} className="bg-gray-800 hover:bg-gray-900 text-white px-4 font-bold">Acessar</button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col p-4 gap-4">
            <div className="flex justify-center flex-wrap gap-4 items-center">
                <div className="flex border border-gray-400 rounded overflow-hidden">
                    <input type="text" value={novaUrl} onChange={(e) => setNovaUrl(e.target.value)} className="p-2 outline-none w-32" placeholder="Novo link" />

                    <button onClick={handleMudarUrl} className="bg-blue-600 hover:bg-blue-700 text-white px-4 font-bold">
                        Mudar URL
                    </button>
                </div>

                <div className="flex border border-gray-400 rounded overflow-hidden">
                    <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="p-2 outline-none w-32" placeholder="Senha" />

                    <button onClick={() => alert("Senha será salva no próximo texto digitado!")} className="bg-gray-800 hover:bg-gray-900 text-white px-4 font-bold">Proteger</button>
                </div>

                <button onClick={handleCompartilhar} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold cursor-pointer">
                    Compartilhar
                </button>
            </div>

            <textarea value={text} onChange={handleDigitacao} className="w-full h-[70vh] p-4 text-md border border-gray-400 rounded resize focus:outline-none"></textarea>
        </div>
    )
}