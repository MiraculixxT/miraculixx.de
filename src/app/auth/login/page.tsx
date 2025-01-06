'use client';
import {useEffect} from "react";
import {redirect, useSearchParams} from "next/navigation";
import {API_URL} from "@/app/config";

export default function AuthenticationRedirect() {
    const params = useSearchParams();
    const state = params.get("state");

    useEffect(() => {
        if (state) {
            const url = `${API_URL}/auth/login?state=${encodeURIComponent(state)}`;
            console.info("Redirecting to ", url);
            redirect(url);
        } else {
            console.error("No state parameter found in the URL");
        }
    }, [state]);

    return (
        <a>Redirecting...</a>
    );
}
