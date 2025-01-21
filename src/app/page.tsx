"use client"
import { access } from "fs";

import { useEffect, useState } from "react";
import { Artist, ArtistsResponse } from "./types/artists";
import { useSearchParams } from 'next/navigation'
import { UserProfile } from "./types/userProfile";
import { fetchArtists, fetchProfile, fetchTracks, getAccessToken, getRefreshToken, redirectToAuthCodeFlow } from "./api/SpotifyService";
import { ArtistSummary } from "./components/ArtistSummary";
import { UserSummary } from "./components/UserSummary";
import { Track } from "./types/Tracks";
import { TrackSummary } from "./components/TrackSummary";


export default function Home() {

  const [profile, setProfile] = useState<UserProfile>();
  const [artists, setArtists] = useState<Artist[]>();
  const [tracks, setTracks] = useState<Track[]>();

  const clientId = process.env.CLIENT_ID ?? "63c3056b9f1843729d26ad0fe8a21fcf";
  const params = useSearchParams();
  const code = params.get("code");
  useEffect(() => {
    if (!code) {

      redirectToAuthCodeFlow(clientId);

    } else {

      const access_token = localStorage.getItem("access_token");

      if (access_token !== null && access_token !== "undefined") {

        const token_time = Number.parseInt(localStorage.getItem("token_time")!);

        if (Date.now() - token_time < (3600 * 1000)) {
          console.log("stored token is ok")
          updateProfile(access_token);
        }
        else {
          getRefreshToken(clientId).then(t => updateProfile(t), error => redirectToAuthCodeFlow(clientId))
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

  const updateProfile = (token: string) => {
    fetchProfile(token).then(p => setProfile(p))
    fetchArtists(token).then(a => setArtists(a.items));
    fetchTracks(token).then(t => setTracks(t.items))
  }


  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8">

        {
          profile ? <UserSummary {...profile}></UserSummary> : <></>
        }

        <h1>Top Artists</h1>
        <ul>
          {
            artists?.slice(0, 5).map((a, i) =>
              <li key={i} className="mb-2">
                <ArtistSummary {...a}></ArtistSummary>
              </li>)
          }
        </ul>

        <h1>Top Songs</h1>
        <ul>
          {
            tracks?.slice(0, 10).map((a, i) =>
              <li key={i} className="mb-2">
                <TrackSummary {...a}></TrackSummary>
              </li>)
          }
        </ul>



      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}




