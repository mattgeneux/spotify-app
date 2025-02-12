import { Artist } from "../types/artists";

export const ArtistSummary = (artist: Artist) => {

    return (<div className="flex flex-row">
        <div className="me-5">
            <img src={artist.images[0].url} height="75" width="75" />
        </div>
        <div className="flex flex-col">
            <div className="text-xl">{artist.name}</div>
            <div className="text-base">{artist.followers.total.toLocaleString()} followers</div></div>

    </div>)


}