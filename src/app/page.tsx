"use client"
import { access } from "fs";

import { useEffect, useState } from "react";
import { Artist, ArtistsResponse } from "./types/artists";
import { useSearchParams } from 'next/navigation'
import { UserProfile } from "./types/userProfile";
import { fetchArtists, fetchProfile, getAccessToken, redirectToAuthCodeFlow } from "./SpotifyService";
import { Token } from "./types/token";

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
      console.log("raw token", rawToken)
      if (rawToken !== null && rawToken !== "undefined") {

        let token;
        try {
          token = JSON.parse(rawToken) as Token;
        }
        catch
        {
          console.log("token is broken")
          localStorage.removeItem("token")
          redirectToAuthCodeFlow(clientId);
          return;
        }

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
                <a href={`/artist/${a.id}`}>{a.name}</a>
              </li>)
          }
        </ol>



      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}




