"use client"
import { access } from "fs";

import { useEffect, useState } from "react";
import { Artist, ArtistsResponse } from "./types/artists";
import { useSearchParams } from 'next/navigation'
import { UserProfile } from "./types/userProfile";
import { fetchArtists, fetchProfile, FetchRange, fetchTracks, getAccessToken, getRefreshToken, redirectToAuthCodeFlow } from "./service/SpotifyService";
import { ArtistSummary } from "./components/ArtistSummary";
import { UserSummary } from "./components/UserSummary";
import { Track } from "./types/Tracks";
import { TrackSummary } from "./components/TrackSummary";
import { TopItems } from "./components/TopItems";


export default function Home() {

  const [profile, setProfile] = useState<UserProfile>();
  const [items, setItems] = useState<{ artists?: Artist[], tracks?: Track[], range?: FetchRange }>();


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
    fetchArtists(token, FetchRange.FOUR_WEEKS).then(a => setItems(prev => ({ ...prev, artists: a.items, range: FetchRange.FOUR_WEEKS })));
    fetchTracks(token, FetchRange.FOUR_WEEKS).then(t => setItems(prev => ({ ...prev, tracks: t.items })))
  }

  const updateItems = async (range: FetchRange) => {
    const token = await findToken();
    const artistsResponse = await fetchArtists(token, range);
    const tracksResponse = await fetchTracks(token, range);
    setItems({ artists: artistsResponse.items, tracks: tracksResponse.items, range })

  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 ">

        {
          profile ? <UserSummary {...profile}></UserSummary> : <></>
        }

        <TopItems items={items} callback={(range: FetchRange) => updateItems(range)} />

      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}




