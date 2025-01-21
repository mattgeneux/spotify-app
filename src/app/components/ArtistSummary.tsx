import { Artist } from "../types/artists";

export const ArtistSummary = (artist: Artist) => {

    return (<div className="flex flex-row">
        <div className="me-5">
            <img src={artist.images[0].url} height="75" width="75" />
        </div>
        <div className="">
            <h1>{artist.name}</h1>
            <h2>{artist.followers.total.toLocaleString()} followers</h2></div>

    </div>)


}