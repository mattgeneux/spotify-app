import { ArtistsResponse } from "../types/artists";
import { TracksResponse } from "../types/Tracks";
import { redirect } from 'next/navigation'
import { UserProfile } from "../types/userProfile";
/**
 * Use code from URL to get initial accesss token and refresh token
 * @param clientId 
 * @param code 
 * @returns a Promise for the access token string
 */
export async function fetchAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:3000");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    if (result.ok) {
        const { access_token, refresh_token } = await result.json();
        const timeNow = Date.now();
        localStorage.setItem("access_token", access_token)
        localStorage.setItem("token_time", timeNow.toString())
        localStorage.setItem("refresh_token", refresh_token)
        return access_token;
    }
    else {
        return Promise.reject();
    }


}
/**
 * Use the stored refresh token to get a new access token and refresh token
 * @param clientId 
 * @returns new access token
 */
export const fetchRefreshToken = async (clientId: string): Promise<string> => {

    // refresh token that has been previously stored
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken == null || refreshToken == "undefined") {
        return Promise.reject();
    }
    const url = "https://accounts.spotify.com/api/token";

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId
        }),
    }
    const body = await fetch(url, payload);
    const response: tokenResponse = await body.json();
    console.log(response);
    const timeNow = Date.now();

    localStorage.setItem("access_token", response.access_token)
    localStorage.setItem("token_time", timeNow.toString())

    if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
    }

    return response.access_token;
}



export async function fetchProfile(token: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const profile = await result.json();
    console.log(profile)
    return await profile
}

export async function fetchArtists(token: string, range: ItemsRange): Promise<ArtistsResponse> {

    const params = new URLSearchParams();
    params.append("time_range", range);
    const result = await fetch("https://api.spotify.com/v1/me/top/artists?" + params.toString(), {
        method: "GET", headers: { Authorization: `Bearer ${token}` },
    });

    const artists = await result.json();
    console.log(artists)
    return await artists
}

export async function fetchTracks(token: string, range: ItemsRange): Promise<TracksResponse> {
    const params = new URLSearchParams();
    params.append("time_range", range);
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks?" + params.toString(), {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const artists = await result.json();
    console.log(artists)
    return await artists
}

export async function redirectToAuthCodeFlow(clientId: string) {
    console.log("after ", clientId)
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:3000");
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);
    redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);

}

function generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export interface tokenResponse {

    access_token: string,
    token_type: string,
    expires_in: number,
    refresh_token: string,
    scope: string

}

export enum ItemsRange {
    FOUR_WEEKS = "short_term",
    SIX_MONTHS = "medium_term",
    ONE_YEAR = "long_term"
}
