"use client";

import { Avatar, AvatarBadge } from "@chakra-ui/react";
import { FC } from "react";

interface UserAvatarProps {
  avatarUrl: string;
}

const UserAvatar: FC<UserAvatarProps> = ({ avatarUrl }) => {
  return (
    <Avatar src={avatarUrl} name="User Profile" size="md">
      <AvatarBadge boxSize="1.25em" bg="green.500" />
    </Avatar>
  );
};

export default UserAvatar;
