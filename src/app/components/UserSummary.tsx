import { UserProfile } from "../types/userProfile";

export const UserSummary = (user: UserProfile) => {
    return (


        <div className="flex flex-row">
            <div className="me-5">
                <img className="rounded-full" src={user.images[0]?.url} width="100" height="100" />
            </div>
            <div className="flex-col">
                <h1>{user.display_name}
                </h1>
                <h2>
                    {user.followers.total} followers
                </h2>

            </div>

        </div>

    )
}