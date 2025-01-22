"use client"
import { access } from "fs";

import { useEffect, useState } from "react";
import { Artist, ArtistsResponse } from "./types/artists";
import { useSearchParams } from 'next/navigation'
import { UserProfile } from "./types/userProfile";
import { fetchArtists, fetchProfile, FetchRange, fetchTracks, getAccessToken, getRefreshToken, redirectToAuthCodeFlow } from "./api/SpotifyService";
import { ArtistSummary } from "./components/ArtistSummary";
import { UserSummary } from "./components/UserSummary";
import { Track } from "./types/Tracks";
import { TrackSummary } from "./components/TrackSummary";
import { TopArtists } from "./components/TopArtists";


export default function Home() {

  const [profile, setProfile] = useState<UserProfile>();
  const [artists, setArtists] = useState<{ artists: Artist[], range: FetchRange }>();
  const [tracks, setTracks] = useState<Track[]>();

  const clientId = process.env.CLIENT_ID ?? "63c3056b9f1843729d26ad0fe8a21fcf";
  const params = useSearchParams();
  const code = params.get("code");
  useEffect(() => {
    if (!code) {

      redirectToAuthCodeFlow(clientId);

    } else {

      findToken().then(t => updateProfile(t), reject => getAccessToken(clientId, code).then(async t => t,
        error => {
          redirectToAuthCodeFlow(clientId);
          return Promise.reject();
        }

      ))
    }
  }, [code])

  const findToken = async (): Promise<string> => {
    const access_token = localStorage.getItem("access_token");

    if (access_token !== null && access_token !== "undefined") {

      const token_time = Number.parseInt(localStorage.getItem("token_time")!);

      if (Date.now() - token_time < (3600 * 1000)) {
        return access_token
      }
      else {
        return await getRefreshToken(clientId)
      }

    }
    else {
      console.log("token not found")
      return Promise.reject();

    }
  }


  const updateProfile = (token: string) => {
    fetchProfile(token).then(p => setProfile(p))
    fetchArtists(token, FetchRange.FOUR_WEEKS).then(a => setArtists({ artists: a.items, range: FetchRange.FOUR_WEEKS }));
    fetchTracks(token).then(t => setTracks(t.items))
  }

  const updateArists = async (range: FetchRange) => {
    await findToken().then(t => fetchArtists(t, range)).then(a => setArtists({ artists: a.items, range }));
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 ">

        {
          profile ? <UserSummary {...profile}></UserSummary> : <></>
        }

        <TopArtists artists={artists} callback={(range: FetchRange) => updateArists(range)} />

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




