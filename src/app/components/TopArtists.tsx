import { FetchRange } from "../service/SpotifyService";
import { Artist } from "../types/artists";
import { ArtistSummary } from "./ArtistSummary";

export const TopArtists = ({ artists, callback }: { artists: { artists: Artist[], range: FetchRange } | undefined, callback: (range: FetchRange) => {} }) => {

    return (

        <div className="flex flex-col">
            <div className="flex-row mb-5">
                <button className={`bg-transparent ${artists?.range == FetchRange.FOUR_WEEKS ? "text-blue-400" : "text-white"} font-semibold hover:text-blue-500 py-2 px-4 border border-white rounded`} onClick={() => callback(FetchRange.FOUR_WEEKS)}>Last month</button>
                <button className={`bg-transparent ${artists?.range == FetchRange.SIX_MONTHS ? "text-blue-400" : "text-white"} font-semibold hover:text-blue-500 py-2 px-4 border border-white rounded ml-5`} onClick={() => callback(FetchRange.SIX_MONTHS)}>Last 6 months</button>
                <button className={`bg-transparent ${artists?.range == FetchRange.ONE_YEAR ? "text-blue-400" : "text-white"} font-semibold hover:text-blue-500 py-2 px-4 border border-white rounded ml-5`} onClick={() => callback(FetchRange.ONE_YEAR)}>Last year</button>
            </div>
            <div>
                <h1>Top Artists</h1>
                <ul>
                    {
                        artists?.artists?.slice(0, 5).map((a, i) =>
                            <li key={i} className="mb-2">
                                <ArtistSummary {...a}></ArtistSummary>
                            </li>)
                    }
                </ul>
            </div>

        </div>
    )
}

