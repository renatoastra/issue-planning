import { ROOM_STATUS } from "@/enum/status";

import { ArrowRight, Crown } from "lucide-react";
import { UserAvatar } from "../Avatar";
import { RemoveUserDropDown } from "../RemoveUserDropDown";
import { SideBarVoteResult } from "../SideBarResult";
import { useUserSidebar } from "@/hooks/use-user-sidebar/useUserSidebar";
import { AnimatePresence, motion, useCycle } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import clsx from "clsx";
import { CollapsedSidebar } from "./collapsed-sidebar";
import { useEffect } from "react";
import { sliceUsername } from "@/utils/slice-username";

const sideVariants = {
  closed: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: -1,
    },
  },
  open: {
    transition: {
      staggerChildren: 0.2,
      staggerDirection: 1,
    },
  },
};

export const UserSideBar = () => {
  const {
    isLoggedUserAdmin,
    labels,
    roomOwnerId,
    usersInRoom,
    step,
    getVoteResult,
  } = useUserSidebar();
  const [open, cycleOpen] = useCycle(false, true);

  useEffect(() => {
    if (step === ROOM_STATUS.VOTED && !open) {
      cycleOpen(1);
    }
  }, [cycleOpen, open, step]);

  const onTap = () => cycleOpen();

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            key={1}
            initial={{ width: 0 }}
            animate={{
              width: 240,
            }}
            exit={{
              width: 120,
            }}
            className={clsx(
              "absolute right-0 z-30 h-full overflow-y-auto border-l  border-l-secondary bg-primary-foreground xl:w-60",
            )}
          >
            {step === ROOM_STATUS.VOTING && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                variants={sideVariants}
              >
                <div className="flex w-full items-center justify-between  ">
                  <h1 className=" p-6 text-3xl font-bold">Usuários</h1>
                  <button className="px-3" onClick={onTap}>
                    <ArrowRight />
                  </button>
                </div>
                <div>
                  {step === ROOM_STATUS.VOTING &&
                    usersInRoom?.map((user) => (
                      <RemoveUserDropDown
                        roomId={roomOwnerId}
                        userId={user.id}
                        isRoomOwner={isLoggedUserAdmin}
                        key={user.id}
                      >
                        <div className="flex items-center justify-between  gap-2 p-3  text-sm hover:bg-secondary hover:bg-opacity-95">
                          <UserAvatar
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
                                <span className="text-sm">
                                  <Crown size={18} />
                                </span>
                              </div>
                            )}
                          </div>
                          <Checkbox disabled checked={user?.voted} />
                        </div>
                      </RemoveUserDropDown>
                    ))}
                </div>
              </motion.div>
            )}
            {step === ROOM_STATUS.VOTED && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className=" p-6 text-3xl font-bold">Resultado</h1>
                <div className="flex flex-col gap-6 p-3   text-sm">
                  {labels.map((label) => (
                    <SideBarVoteResult
                      key={label}
                      users={getVoteResult}
                      roomOwnerId={roomOwnerId}
                      voteValue={label}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && <CollapsedSidebar cycleOpen={cycleOpen} />}
      </AnimatePresence>
    </>
  );
};
