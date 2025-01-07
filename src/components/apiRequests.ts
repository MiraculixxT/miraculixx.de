import {redirect} from "next/navigation";
import {getToken} from "./tokenCookie";
import {API_URL} from "@/app/config";

export async function accessProtectedAPI(url: string, header: HeadersInit, prev: string): Promise<Response> {
    function authenticate() {
        const state = encodeURIComponent(prev);
        const authUrl = `/auth/login?state=${state}`;
        console.info("Redirect to ", authUrl);
        redirect(authUrl);
    }

    const token = await getToken();
    if (!token) {
        console.warn("No auth token found in the cookies");
        authenticate();
    }

    const finalHeaders = new Headers(header);
    if (token) finalHeaders.append('Authorization', token);
    const response = await fetch(`${API_URL}/${url}`, {
        headers: finalHeaders
    });

    if (response.status == 401) {
        authenticate();
    }

    return response;
}

export async function fetchMediaFile(url: string, headers: HeadersInit): Promise<string | null> {
    const response = await fetch(url, { headers });
    if (!response.ok) {
        console.warn(`Failed to fetch media file: ${response.statusText}`);
        return null;
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
