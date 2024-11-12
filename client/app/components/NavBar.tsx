import { HStack, IconButton, Box } from "@chakra-ui/react";
import { FaHome, FaTrophy, FaUserFriends, FaWallet } from "react-icons/fa";
import GradientBorderWrapper from './GradientBorderWrapper';
import Link from "next/link";
import { useRouter } from "next/router";

const NavBar = () => {
  const router = useRouter();

  const navItems = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/earn", icon: FaTrophy, label: "Earn" },
    { href: "/invites", icon: FaUserFriends, label: "Invites" },
    { href: "/wallet", icon: FaWallet, label: "Wallet" },
  ];

  return (

    <GradientBorderWrapper
      borderRadius={12}
      startColor="#793BC7"
      endColor="#C2D2FF"
      strokeWidth={1.5}
      position="fixed"
      bottom={7}
      left="50%"
      transform="translateX(-50%)"
      p={3}  // Padding для видимой обводки
      bg="transparent"
      backgroundClip="padding-box"
    >
      <HStack spacing={4}>
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href} passHref>
              <IconButton
                as="a"
                aria-label={item.label}
                icon={<item.icon />}
                fontSize="20px"
                variant="solid"
                color="white"
                w="80px"
                h="45px"
                borderRadius="12px"
                bg={isActive ? "linear-gradient(45deg, #FF56F9, #724BFF)" : "#111030"}
                _hover={{
                  bg: isActive ? "linear-gradient(45deg, #FF56F9, #724BFF)" : "#1A1A3D",
                }}
              />
            </Link>
          );
        })}
      </HStack>
    </GradientBorderWrapper>
  );
};

export default NavBar;
