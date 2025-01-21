import { Track } from "../types/Tracks"

export const TrackSummary = (track: Track) => {
    return (<div className="flex flex-row">
        <div className="me-5">
            <img src={track.album.images[0].url} height="75" width="75" />
        </div>
        <div className="">
            <h1>{track.name}</h1>
        </div>

    </div>)
}