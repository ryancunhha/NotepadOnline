import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [slug, setNomeNota] = useState("");
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

    const criarSalvaNota = async () => {
        const slugLimpo = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "")

        try {
            const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: slugLimpo, conteudo: "", senha: "" })
            });

            if (res.ok) {
                navigate(`/${slugLimpo}`);
            } else {
                console.error("Erro")
                alert("Já existente")
            }
        } catch (err) {
            console.log("Erro")
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Notepad Online</h1>
            <p className="text-gray-600 mb-8 text-center">Escolha uma URL ou use gerado aleatoriamente.</p>

            <div className="flex flex-row items-center border border-gray-400 rounded-lg overflow-hidden">
                <span className="pl-2 pr-0 text-gray-500 font-medium truncate">notepad-on.vercel.app/</span>
                <input className="py-3 pr-2 text-gray-800 outline-none max-w-20 font-medium" type="text" value={slug} onChange={(e) => setNomeNota(e.target.value)} />

                <button className="px-4 py-3 bg-blue-600 text-white font-bold cursor-pointer" onClick={criarSalvaNota}>OK</button>
            </div>

            <p className="text-gray-600 mt-8 text-center text-xs">A URL será excluído automaticamente após 24 horas de inatividade.</p>
        </div>
    )
}