import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [slugSelecioando, setSlugSelecioando] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        setSlugSelecioando(crypto.randomUUID().slice(0, 6));
    }, []);

    const criarSalvaNota = async () => {
        const slug = slugSelecioando.toLowerCase().trim().replace(/[^a-z0-9-]/g, "")

        try {
            const res = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slug: slug })
            });

            if (res.ok) {
                navigate(`/${slug}`);
            }
        } catch (error) {
            console.log("Algo deu errado", error)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center p-1">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">Notepad Online</h1>
            <p className="text-gray-600 mb-8 text-center">Escolha uma URL ou use gerado aleatoriamente.</p>

            <div className="flex flex-col md:flex-row items-stretch md:items-center border min-w-10 border-gray-400 rounded overflow-hidden w-full max-w-lg">
                <div>
                    <span className="whitespace-nowrap text-sm pl-2 pr-0 text-gray-500 font-medium truncate">notepad-on.vercel.app/</span>
                    <input className="py-3 pr-2 text-gray-800 outline-none min-w-0 font-medium" type="text" value={slugSelecioando} onChange={(e) => setSlugSelecioando(e.target.value)} />
                </div>
                
                <button className="px-4 py-3 bg-blue-600 text-white font-bold cursor-pointer" onClick={criarSalvaNota}>OK</button>
            </div>

            <p className="text-gray-600 mt-8 text-center text-xs">A URL será excluído automaticamente após 24 horas de inatividade.</p>
        </div>
    )
}