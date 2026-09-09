import { Outlet } from "react-router-dom";
import Header from "../componente/header/header";

export default function Layout() {
    return (
        <>
            <Header />

            <main className="flex justify-center min-h-[90vh] mx-auto max-w-7xl">
                <Outlet />
            </main>
        </>
    )
}