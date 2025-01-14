"use client"
import { access } from "fs";

import { useEffect, useState } from "react";
import { Artist, ArtistsResponse } from "./types/artists";
import { useSearchParams } from 'next/navigation'
import { UserProfile } from "./types/userProfile";

export default function Home() {

  const [profile, setProfile] = useState<UserProfile>();
  const [artists, setArtists] = useState<Artist[]>();

  const clientId = process.env.CLIENT_ID ?? "63c3056b9f1843729d26ad0fe8a21fcf";
  const params = useSearchParams();
  const code = params.get("code");
  useEffect(() => {
    if (!code) {
      console.log("before", clientId)
      redirectToAuthCodeFlow(clientId);


    } else {
      const rawToken = localStorage.getItem("token")
      if (rawToken !== null && rawToken !== "undefined") {

        const token = JSON.parse(rawToken) as Token;
        console.log("token found", token)
        if (Date.now() - token.time < (3600 * 1000)) {
          console.log("stored token is ok")
          fetchProfile(token.value).then(p => setProfile(p))
          fetchArtists(token.value).then(a => setArtists(a.items));
        }
        else {
          // refresh token?
          // getAccessToken(clientId, code).then(async t => {
          //   console.log("fetch artists")
          //   await fetchArtists(t).then(a => setArtists(a.items));
          //   console.log("fetch profile")
          //   await fetchProfile(t).then(p => setProfile(p));

          // })
          console.log("stored token has expired")
          redirectToAuthCodeFlow(clientId);
        }

      }
      else {
        console.log("token not found")


        getAccessToken(clientId, code).then(async t => {
          console.log("fetch artists")
          await fetchArtists(t).then(a => setArtists(a.items));
          console.log("fetch profile")
          await fetchProfile(t).then(p => setProfile(p));

        },
          error =>
            redirectToAuthCodeFlow(clientId)
        )



      }

    }
  }, [code])



  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <img src={profile?.images[0]?.url} />
          <div className="mb-2">
            {profile?.display_name}
          </div>
          <div className="mb-2">
            {profile?.email}
          </div>
        </div>
        <ol className="list-decimal">
          {
            artists?.slice(0, 5).map((a, i) =>
              <li key={i} className="mb-2">
                {a.name}
              </li>)
          }
        </ol>



      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}


export async function getAccessToken(clientId: string, code: string): Promise<string> {
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
    const { access_token } = await result.json();
    const timeNow = Date.now();
    const token: Token = { value: access_token, time: timeNow }
    localStorage.setItem("token", JSON.stringify(token))
    return access_token;
  }
  else {
    return Promise.reject();
  }


}
async function fetchProfile(token: string): Promise<UserProfile> {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  const profile = await result.json();
  console.log(profile)
  return await profile
}

async function fetchArtists(token: string): Promise<ArtistsResponse> {
  const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
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

  document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
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



interface Token {
  value: string;
  time: number;
}