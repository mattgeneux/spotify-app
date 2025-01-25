import { ItemsRange } from "../service/SpotifyService";
import { Artist } from "../types/artists";
import { Track } from "../types/Tracks";
import { ArtistSummary } from "./ArtistSummary";
import { TrackSummary } from "./TrackSummary";

export const TopItems = ({ items, callback }: { items: { artists?: Artist[], tracks?: Track[], range?: ItemsRange } | undefined, callback: (range: ItemsRange) => {} }) => {

    return (

        <div className="flex flex-col">

            <div className="px-40">

                <div className="flex flex-row justify-start">
                    <div className="pr-20 flex-col">
                        <h1 className="font-bold text-4xl mb-5">Top Artists</h1>
                        <ul>
                            {
                                items?.artists?.slice(0, 5).map((a, i) =>
                                    <li key={i} className="mb-2">
                                        <ArtistSummary {...a}></ArtistSummary>
                                    </li>)
                            }
                        </ul>
                    </div>

                    <div className="pl-20 flex-col">
                        <h1 className="font-bold text-4xl mb-5">Top Songs</h1>
                        <ul>
                            {
                                items?.tracks?.slice(0, 5).map((t, i) =>
                                    <li key={i} className="mb-2">
                                        <TrackSummary {...t}></TrackSummary>
                                    </li>)
                            }
                        </ul>
                    </div>
                </div>
                <div className="flex-row mt-5">
                    <button className={`bg-transparent ${items?.range == ItemsRange.FOUR_WEEKS ? "text-blue-400" : "text-white"} font-semibold hover:text-blue-500 py-2 px-4  border border-white rounded`} onClick={() => callback(ItemsRange.FOUR_WEEKS)}>Last month</button>
                    <button className={`bg-transparent ${items?.range == ItemsRange.SIX_MONTHS ? "text-blue-400" : "text-white"} font-semibold hover:text-blue-500 py-2 px-4 border border-white rounded ml-10`} onClick={() => callback(ItemsRange.SIX_MONTHS)}>Last 6 months</button>
                    <button className={`bg-transparent ${items?.range == ItemsRange.ONE_YEAR ? "text-blue-400" : "text-white"} font-semibold hover:text-blue-500 py-2 px-4 border border-white rounded ml-10`} onClick={() => callback(ItemsRange.ONE_YEAR)}>Last year</button>
                </div>
            </div>



        </div>
    )
}

