import { Outlet } from "react-router-dom";
import Header from "../componente/header/header";

export default function Layout() {
    return (
        <div>
            <Header />

            <main className="mx-auto max-w-7xl">
                <Outlet />
            </main>
        </div>
    )
}