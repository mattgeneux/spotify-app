import { Artist } from "./types/artists";

export function Artist(artist: Artist) {

    return (<div className="">
        <h1>{artist.name}</h1>
        <h2>{artist.followers.total} followers</h2>
    </div>)


}