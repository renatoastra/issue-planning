import { type UsersInRoom } from "@/types/users-in-room";
import { UserAvatar } from "../Avatar";
import { Checkbox } from "@radix-ui/react-checkbox";
import { sliceUsername } from "@/utils/slice-username";

interface SideBarVoteResultProps {
  roomOwnerId: string;
  users: UsersInRoom[];
  voteValue: string;
}

export const SideBarVoteResult = ({
  users,
  roomOwnerId,
  voteValue,
}: SideBarVoteResultProps) => {
  const getVoteByValue = (value: string, users: UsersInRoom[]) => {
    return users?.filter((user) => user.choose === value);
  };

  const userArray = getVoteByValue(voteValue, users);
  return (
    <div className="border-b border-indigo-300 dark:border-secondary">
      <h3 className="text-2xl font-bold">{`${voteValue} - `}</h3>
      {userArray.length > 0 &&
        userArray?.map((user) => {
          return (
            <>
              <div className="flex items-center justify-between gap-2  p-3  text-sm hover:bg-secondary hover:bg-opacity-95">
                <UserAvatar
                  className="h-8 w-8 rounded-full"
                  src={user?.user_image_url ?? ""}
                  fallback={user?.username ?? ""}
                />
                <div className=" flex items-center justify-center gap-2  ">
                  <p className="hidden lg:block">
                    {user?.username && user?.username?.length > 12
                      ? sliceUsername(user?.username, 12)
                      : user?.username}
                  </p>
                  {roomOwnerId === user?.id && (
                    <div title="Room leader" className="text-start">
                      <span className="text-xs">👑</span>
                    </div>
                  )}
                </div>
                <Checkbox disabled checked={user?.voted} />
              </div>
            </>
          );
        })}
      {!userArray.length && (
        <div className="flex items-center justify-between  gap-2 p-3  text-sm hover:bg-secondary hover:bg-opacity-95">
          <p>Nenhum voto </p>
        </div>
      )}
    </div>
  );
};
