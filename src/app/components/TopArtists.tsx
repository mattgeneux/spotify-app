import { FetchRange } from "../api/SpotifyService";
import { Artist } from "../types/artists";
import { ArtistSummary } from "./ArtistSummary";

export const TopArtists = ({ artists, callback }: { artists: Artist[] | undefined, callback: () => {} }) => {

    return (

        <div>

            <h1>Top Artists</h1>
            <ul>
                {
                    artists?.slice(0, 5).map((a, i) =>
                        <li key={i} className="mb-2">
                            <ArtistSummary {...a}></ArtistSummary>
                        </li>)
                }
            </ul>
        </div>
    )
}

