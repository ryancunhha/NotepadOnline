import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="flex justify-between items-center p-1 px-6 gap-6">
            <a className="bg-[#D83277] text-white px-2.5 rounded truncate" href="https://ryancunha.vercel.app">Site @ryancunhha</a>
            
            <div>
                <Link to="/" >Home</Link>
            </div>
        </header>
    )
}