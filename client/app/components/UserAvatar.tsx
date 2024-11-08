"use client";

import {
  AvatarFallback,
  AvatarIcon,
  AvatarImage,
  AvatarRoot,
  HStack,
} from "@chakra-ui/react";
import { FC } from "react";

interface UserAvatarProps {
  avatarUrl: string;
}

const UserAvatar: FC<UserAvatarProps> = ({ avatarUrl = "" }) => {
  return (
    <HStack>
      <AvatarRoot>
        <AvatarImage src={avatarUrl} alt="User Profile" />
        <AvatarFallback>JD</AvatarFallback>
        <AvatarIcon>👤</AvatarIcon>
      </AvatarRoot>
    </HStack>
  );
};

export default UserAvatar;
