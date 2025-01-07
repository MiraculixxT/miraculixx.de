'use client';
import {setToken} from "@/components/tokenCookie";
import {redirect} from "next/navigation";
import {useEffect} from "react";


export default function AuthenticationCallback() {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get("token");
        const state = searchParams.get("state");

        if (token) {
            setToken(token).then(() => {
            });
        }

        if (state) {
            console.info("Redirecting to ", state);
            redirect(state);
        } else {
            console.warn("No state parameter found in the URL");
            redirect('/');
        }
    }, []);

    return (<div>Loading..</div>);
}
