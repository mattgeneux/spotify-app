import { Track } from "../types/Tracks"

export const TrackSummary = (track: Track) => {
    return (<div className="flex flex-row">
        <div className="me-5">
            <img src={track.album.images[0].url} height="75" width="75" />
        </div>
        <div className="flex flex-col">
            <div>{track.name}</div>
            <div>{track.artists.map(a => a.name).join(", ")}</div>
        </div>

    </div>)
}