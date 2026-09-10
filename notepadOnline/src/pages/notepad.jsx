import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Notepad() {
    const TimeoutRef = useRef(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const [carregando, setCarregar] = useState(true)
    const [text, setText] = useState("");
    const [novaUrl, setNovaUrl] = useState(slug);
    const [senha, setSenha] = useState("");
    const [senhaOriginal, setSenhaOriginal] = useState("");
    const [existe, setExiste] = useState(true);
    const [bloqueadoPorSenha, setBloqueadoPorSenha] = useState(false);
    const [senhaDigitada, setSenhaDigitada] = useState("");

    useEffect(() => {
        async function carregarNota() {
            setCarregar(true)

            try {
                const res = await fetch(`/api/pegar?slug=${encodeURIComponent(slug)}`);
                const data = await res.json();

                if (res.status === 404 || !data.existe) {
                    setExiste(false);
                    return;
                }

                setExiste(true);

                if (data.protegido) {
                    setBloqueadoPorSenha(true);
                } else {
                    setText(data.conteudo || "");
                    setBloqueadoPorSenha(false);
                }
            } catch (err) {
                console.error("Erro ao carregar:", err);
            } finally {
                setCarregar(false)
            }
        }

        carregarNota();
        setNovaUrl(slug);
        setSenhaDigitada("");
    }, [slug]);

    const AddProteger = async () => {
        try {
            const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, conteudo: text, senha: senhaOriginal, novaSenha: senha })
            });

            if (!res.ok) {
                alert("Você não pode alterar a senha desta nota.");
                return;
            }

            setSenhaOriginal(senha);

            if (senha) {
                alert("Senha salva com sucesso!");
            } else {
                alert("Senha removida! A nota agora é pública.");
            }
        } catch (error) {
            console.error("Algo deu errado", error);
        }
    };

    const desbloquear = async () => {
        if (!senhaDigitada) return alert("Digite a senha!");

        try {
            const res = await fetch(`/api/desbloquear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug, senha: senhaDigitada, novaSenha: senha })
            });

            const data = await res.json();

            if (res.ok) {
                setText(data.conteudo);
                setBloqueadoPorSenha(false);
                setSenhaOriginal(senhaDigitada)
            } else {
                alert("Senha incorreta!");
            }
        } catch (error) {
            console.error("Algo deu errado", error);
        }
    };

    const SalvarTexto = async (e) => {
        const novoTexto = e.target.value;
        setText(novoTexto);

        if (TimeoutRef.current) {
            clearTimeout(TimeoutRef.current);
        }

        TimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch("/api/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug, conteudo: novoTexto, senha: senhaOriginal })
                });

                if (res.status === 429) {
                    console.log("Save muito frequente")
                    return
                }

                if (!res.ok) {
                    console.log("erro ao salvar")
                }
            } catch (error) {
                console.error("Algo deu errado", error);
            }
        }, 3000);
    };

    const MudarUrl = async () => {
        const slugNovo = novaUrl.trim().replace(/\s+/g, "-").toLowerCase();

        if (!slugNovo || slugNovo === slug) return

        try {
            const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: slugNovo, conteudo: text, slugAntigo: slug, senha: senhaOriginal })
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.error) alert("Essa URL já está em uso! Escolha outra URL.");
                return
            }

            alert("URL alterada com sucesso!");
            navigate(`/${data.slug}`);
        } catch (error) {
            alert("Algo deu errado")
            console.error("Algo deu errado", error);
        }
    };

    const handleCompartilhar = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado: " + window.location.href);
    }

    if (carregando) return <div></div>

    if (!existe) {
        return (
            <p className="text-center text-3xl font-bold text-gray-800 mt-10">Página Não Encontrada!</p>
        )
    }

    if (bloqueadoPorSenha) {
        return (
            <div className="flex flex-col p-4 mt-10">
                <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Esta página é protegida por senha</h1>

                <div className="flex justify-between border border-gray-400 overflow-hidden rounded bg-white">
                    <input id="password" type="password" value={senhaDigitada} onChange={(e) => setSenhaDigitada(e.target.value)} className="p-2 outline-none" placeholder="Digite a senha" />

                    <button type="button" onClick={desbloquear} className="bg-gray-800 text-white px-4 font-bold">
                        Acessar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col p-4 gap-4 w-full">
            <textarea id="textarea" value={text} onChange={SalvarTexto} className="w-full h-[70vh] p-4 border border-gray-400 rounded resize focus:outline-none"></textarea>

            <div className="flex justify-center flex-wrap gap-4 items-center">
                <div className="flex border border-gray-400 rounded overflow-hidden">
                    <input id="url" type="text" value={novaUrl} onChange={(e) => setNovaUrl(e.target.value)} className="p-2 outline-none w-32" placeholder="Nova URL" />

                    <button type="button" onClick={MudarUrl} className="bg-blue-600 text-white px-4 font-bold cursor-pointer">
                        Mudar URL
                    </button>
                </div>

                <div className="flex border border-gray-400 rounded overflow-hidden">
                    <input id="password" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="p-2 outline-none w-32" placeholder="Senha" />

                    <button type="button" onClick={AddProteger} className="bg-gray-800 text-white px-4 font-bold cursor-pointer">Proteger</button>
                </div>

                <button type="button" onClick={handleCompartilhar} className="bg-green-600 text-white px-6 py-2 rounded font-bold cursor-pointer">
                    Compartilhar
                </button>
            </div>
        </div>
    )
}