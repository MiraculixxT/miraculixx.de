'use client';
export const dynamic = 'force-dynamic';
import {useEffect} from "react";
import {redirect} from "next/navigation";
import {API_URL} from "@/app/config";


export default function AuthenticationRedirect() {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const state = searchParams.get("state");

        if (state) {
            const url = `${API_URL}/auth/login?state=${encodeURIComponent(state)}`;
            console.info("Redirecting to ", url);
            redirect(url);
        } else {
            console.error("No state parameter found in the URL");
        }
    }, []);

    return (
        <a>Redirecting...</a>
    );
}
