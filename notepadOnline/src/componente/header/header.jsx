import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="flex justify-center p-1 px-6 gap-6 text-sm">
            <Link to="/" >Home</Link>
            <a href="https://ryancunha.vercel.app">Blog</a>
        </header>
    )
}