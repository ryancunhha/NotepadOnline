import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [nomeNota, setNomeNota] = useState("");
    const navigate = useNavigate();

    const gerarSlugAleatorio = () => {
        const caracteres = "abcdefghijklmnopqrstuvwxyz0123456789";
        let resultado = "";

        for (let i = 0; i < 6; i++) {
            resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }

        return resultado;
    };

    useEffect(() => {
        setNomeNota(gerarSlugAleatorio());
    }, []);

    const criarNota = async () => {
        const slugLimpo = nomeNota.trim().replace(/\s+/g, "-").toLowerCase();

        if (slugLimpo) {
            try {
                await fetch("/api/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ slug: slugLimpo, conteudo: "", senha: "" })
                });

                navigate(`/${slugLimpo}`);
            } catch (err) {
                navigate(`/${slugLimpo}`);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") criarNota();
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Notepad Online</h1>
            <p className="text-gray-600 mb-8">Escolha um nome ou use o gerado aleatoriamente</p>

            <div className="flex flex-row items-center border border-gray-400 rounded-lg overflow-hidden">
                <span className="pl-4 pr-0 text-gray-500 font-medium select-none">notepad.vercel.app/</span>
                <input className="py-3 pr-2 text-gray-800 outline-none w-48 font-medium" type="text" value={nomeNota} onChange={(e) => setNomeNota(e.target.value)} onKeyDown={handleKeyDown} />

                <button className="px-6 py-3 bg-blue-600 text-white font-bold cursor-pointer" onClick={criarNota}>OK</button>
            </div>
        </div>
    )
}