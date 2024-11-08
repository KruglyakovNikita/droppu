import { HStack, IconButton } from "@chakra-ui/react";
import { FaHome, FaTrophy, FaUserFriends, FaWallet } from "react-icons/fa";
import Link from "next/link";

const NavBar = () => {
  return (
    <HStack
      as="nav"
      position="fixed"
      bottom={0}
      width="100%"
      justifyContent="space-around"
      bg="gray.800"
      p={4}
      color="white"
    >
      <Link href="/">
        <IconButton aria-label="Home" variant="ghost" colorScheme="whiteAlpha">
          <FaHome />
        </IconButton>
      </Link>
      <Link href="/earn">
        <IconButton aria-label="Earn" variant="ghost" colorScheme="whiteAlpha">
          <FaTrophy />
        </IconButton>
      </Link>
      <Link href="/invites">
        <IconButton
          aria-label="Invites"
          variant="ghost"
          colorScheme="whiteAlpha"
        >
          <FaUserFriends />
        </IconButton>
      </Link>
      <Link href="/wallet">
        <IconButton
          aria-label="Wallet"
          variant="ghost"
          colorScheme="whiteAlpha"
        >
          <FaWallet />
        </IconButton>
      </Link>
    </HStack>
  );
};

export default NavBar;
