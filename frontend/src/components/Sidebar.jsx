import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users = [],
    selectedUser,
    setSelectedUser,
    isUsersLoading,
  } = useChatStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
      </div>

      {/* Users list */}
      <div className="overflow-y-auto w-full py-3">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${
                selectedUser?.id === user.id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            {/* Avatar */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profile_pic || "/avatar.png"}
                alt={user.full_name}
                className="size-12 object-cover rounded-full"
              />
            </div>

            {/* User info */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">
                {user.full_name}
              </div>
              <div className="text-sm text-zinc-400">
                Tap to chat
              </div>
            </div>
          </button>
        ))}

        {users.length === 0 && (
          <div className="text-center text-zinc-500 py-4">
            No users found
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
