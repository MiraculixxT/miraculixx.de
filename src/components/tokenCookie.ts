'use server';
import {cookies} from 'next/headers';

export async function getToken() {
    return (await cookies()).get('authToken')?.value;
}

export async function setToken(token: string) {
    (await cookies()).set('authToken', token);
}
