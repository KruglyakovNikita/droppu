import { HStack, IconButton, Box } from "@chakra-ui/react";
import { FaHome, FaTrophy, FaUserFriends, FaWallet } from "react-icons/fa";
import GradientBorderWrapper from "./GradientBorderWrapper";
import Link from "next/link";
import { useRouter } from "next/router";
import { useStore } from "../lib/store/store";

const NavBar = () => {
  const router = useRouter();
  const navbarVisible = useStore((state) => state.navbarVisible);

  if (!navbarVisible) return null;

  const navItems = [
    { href: "/", icon: FaHome, label: "Home" },
    { href: "/earn", icon: FaTrophy, label: "Earn" },
    { href: "/invites", icon: FaUserFriends, label: "Invites" },
    { href: "/wallet", icon: FaWallet, label: "Wallet" },
  ];

  return (
    <GradientBorderWrapper
      startColor="#793BC7"
      endColor="#C2D2FF"
      strokeWidth={1.5}
      position="fixed"
      bottom={7}
      left="50%"
      transform="translateX(-50%)"
      p={3}
      zIndex="999"
      bg="transparent"
      backgroundClip="padding-box"
      w={["90%", "80%", "400px"]} // Адаптивная ширина: 90% на маленьких экранах, 80% на средних и фиксированная ширина на больших
      maxW="400px" // Ограничение максимальной ширины NavBar
    >
      <HStack spacing={0} justify="space-between" w="100%" zIndex="999">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              passHref
              onClick={() => router.push(item.href)}
            >
              <IconButton
                as="a"
                aria-label={item.label}
                icon={<item.icon />}
                fontSize="20px"
                variant="solid"
                color="white"
                flex="1"
                h="45px"
                w="70px"
                borderRadius="12px"
                bg={
                  isActive
                    ? "linear-gradient(45deg, #FF56F9, #724BFF)"
                    : "#111030"
                }
                _hover={{
                  bg: isActive
                    ? "linear-gradient(45deg, #FF56F9, #724BFF)"
                    : "#1A1A3D",
                }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              />
            </Link>
          );
        })}
      </HStack>
    </GradientBorderWrapper>
  );
};

export default NavBar;
