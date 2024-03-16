import { UserAvatar } from "@/components/Avatar";
import { RemoveUserDropDown } from "@/components/RemoveUserDropDown";
import { ROOM_STATUS } from "@/enum/status";
import { useUserSidebar } from "@/hooks/use-user-sidebar/useUserSidebar";
import clsx from "clsx";
import { motion } from "framer-motion";
import { ArrowLeft, Crown } from "lucide-react";

interface CollapsedSidebarProps {
  cycleOpen: () => void;
}
export const CollapsedSidebar = ({ cycleOpen }: CollapsedSidebarProps) => {
  const {
    getVoteResult,
    isLoggedUserAdmin,
    labels,
    roomOwnerId,
    usersInRoom,
    step,
    setOpen,
  } = useUserSidebar();

  return (
    <motion.aside
      key={"collapsed"}
      initial={{ width: 0 }}
      animate={{
        width: 120,
      }}
      exit={{
        width: 0,
      }}
      className={clsx(
        "absolute right-0 z-30 h-full overflow-y-auto border-l border-l-secondary  bg-primary-foreground py-7 xl:w-60",
      )}
    >
      {step === ROOM_STATUS.VOTING && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="collapsed-div"
        >
          <div className="flex flex-col gap-4">
            <button onClick={cycleOpen} className="px-3">
              <ArrowLeft size={24} />
            </button>
            {step === ROOM_STATUS.VOTING &&
              usersInRoom?.map((user) => (
                <RemoveUserDropDown
                  roomId={roomOwnerId}
                  userId={user.id}
                  isRoomOwner={isLoggedUserAdmin}
                  key={user.id + "collapsed"}
                >
                  <div className="flex items-center justify-center   hover:bg-secondary hover:bg-opacity-95">
                    <motion.div
                      className="flex rounded-full "
                      animate={{
                        borderColor: user.voted ? "#22C55E" : "#EF4444",
                        borderWidth: 2,
                      }}
                      initial={{ borderColor: "#fff", borderWidth: 2 }}
                      transition={{ duration: 1 }}
                    >
                      <UserAvatar
                        src={user?.user_image_url ?? ""}
                        fallback={user?.username ?? ""}
                        className={clsx(`h-11 w-11 border-2`)}
                      />
                    </motion.div>
                  </div>
                </RemoveUserDropDown>
              ))}
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
};
