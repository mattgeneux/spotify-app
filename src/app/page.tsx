"use client"
import { access } from "fs";

import { useEffect, useState } from "react";
import { Artist } from "./types/artists";
import { useSearchParams } from 'next/navigation'
import { UserProfile } from "./types/userProfile";
import { fetchArtists, fetchProfile, FetchRange, fetchTracks, fetchAccessToken, fetchRefreshToken, redirectToAuthCodeFlow } from "./service/SpotifyService";
import { UserSummary } from "./components/UserSummary";
import { Track } from "./types/Tracks";
import { TopItems } from "./components/TopItems";


export default function Home() {

  const [profile, setProfile] = useState<UserProfile>();
  const [state, setState] = useState<Record<FetchRange, { artists: Artist[], tracks: Track[] }>>({
    [FetchRange.FOUR_WEEKS]: { artists: [], tracks: [] },
    [FetchRange.SIX_MONTHS]: { artists: [], tracks: [] },
    [FetchRange.ONE_YEAR]: { artists: [], tracks: [] },
  }

  )
  const [selectedRange, setSelectedRange] = useState<FetchRange>(FetchRange.FOUR_WEEKS);


  const clientId = process.env.CLIENT_ID ?? "63c3056b9f1843729d26ad0fe8a21fcf";
  const params = useSearchParams();
  const code = params.get("code");
  useEffect(() => {
    if (!code) {

      redirectToAuthCodeFlow(clientId);

    } else {

      findToken().then(t => updateProfile(t), reject => fetchAccessToken(clientId, code).then(async t => t,
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
        return await fetchRefreshToken(clientId)
      }

    }
    else {
      console.log("token not found")
      return Promise.reject();

    }
  }


  const updateProfile = async (token: string) => {
    fetchProfile(token).then(p => setProfile(p))
    updateItems(token, selectedRange);
  }

  const updateItems = async (token: string, range: FetchRange) => {
    setSelectedRange(range);
    if (state[range].artists.length == 0 || state[range].tracks.length == 0) {
      const artistsResponse = await fetchArtists(token, range);
      const tracksResponse = await fetchTracks(token, range);
      updateState(range, artistsResponse.items, tracksResponse.items);
    }


  }

  const updateState = (range: FetchRange, artists: Artist[], tracks: Track[]) => {
    setState(prevState => ({
      ...prevState,
      [range]: {
        artists,
        tracks,
      },
    }));
  }

  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 ">

        {
          profile ? <UserSummary {...profile}></UserSummary> : <></>
        }

        <TopItems items={{ range: selectedRange, ...state[selectedRange] }} callback={(range: FetchRange) => findToken().then(t => updateItems(t, range))} />

      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">

      </footer>
    </div>
  );
}




