'use client';
import {redirect, useSearchParams} from "next/navigation";
import {useEffect} from "react";
import {API_URL} from "@/app/config";
import {setToken} from "@/components/tokenCookie";

export default function AuthenticationCallback() {
    const params = useSearchParams();
    const state = params.get("state");
    const token = params.get("token");

    useEffect(() => {
        async function fetch() {
            if (token) {
                await setToken(token);
            }

            if (state) {
                console.info("Redirecting to ", state);
                redirect(state);
            } else {
                console.warn("No state parameter found in the URL");
                redirect('/');
            }
        }

        fetch().then(_ => { });
    }, [state, token]);

    return (
        <a>Redirecting...</a>
    );
}