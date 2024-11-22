import {
  Box,
  Flex,
  Avatar,
  Text,
  Grid,
  Card,
  Stack,
  Image,
  Heading,
} from "@chakra-ui/react";
import type { TelegramWebApps } from 'telegram-webapps-types-new';
import { keyframes } from "@emotion/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import { useEffect, useState } from "react";
import colors from "../theme/colors";
import { useStore } from "../app/lib/store/store";
import { initUser } from "@/app/lib/api/user";
import { ButtonIfoLink } from "@/app/components/ButtonIfoLink";

declare global {
  interface Window {
    TgWebApp?: TelegramWebApps.WebApp;
  }
}

const Home: React.FC = () => {
  const setUser = useStore((state) => state.setUser);
  const userInfo = useStore((state) => state.user);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    const authenticate = async (initData: string) => {
      try {
        const response = await initUser(initData);
        const data = response.data;

        if (data) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Request Error:", error);
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.TgWebApp) {
        const tg = window.TgWebApp;
        if (tg.initDataUnsafe) {
          setTelegramUser(tg.initDataUnsafe.user);
          console.log(tg.initDataUnsafe);
          console.log(tg.initData);
          authenticate(
            JSON.parse(JSON.stringify(tg.initDataUnsafe).replace(/'/g, '"'))
          );
          tg.ready();
          tg.expand();
          tg.setHeaderColor("#0D1478");
          tg.HapticFeedback.notificationOccurred("warning");
          window.TgWebApp.disableVerticalSwipes();
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const inviteFriendsLink = () => {
    window.TgWebApp?.HapticFeedback.impactOccurred("soft");
    window.TgWebApp?.openTelegramLink(
      `https://t.me/share/url?url=https://t.me/DroppuBot/start?startapp=${telegramUser?.id}&text=%0A%0A🚀 Jump into action with @Droppu's jetpack game and earn $JET tokens soon!%0A🌟 Get a 750 rating boost just for joining!%0A💥 Premium players score a massive 1000 rating boost!`
    );
  };

  const chanelLink = () => {
    window.TgWebApp?.HapticFeedback.impactOccurred("soft");
    window.TgWebApp?.openTelegramLink(`https://t.me/droppu`);
  };

  const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
  `;

  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color={colors.primaryText}
      minH="100vh"
      overflowY="scroll"
      p={4}
    >
      <Grid mt={0} gap={4} templateColumns="repeat(2, 1fr)">
        <ButtonIfoLink
          title="DROPPU NEWS"
          description=" Follow us for updates"
          onClick={chanelLink}
          startIcon={
            <Image
              src="/icons/star_icon.svg"
              alt="Tribes Icon"
              boxSize="23px"
              mr={2}
            />
          }
        />

        <ButtonIfoLink
          title="Invite Friends"
          description="Get more tickets and points"
          onClick={inviteFriendsLink}
          descriptionFontSize="8px"
          titleFontSize="16px"
          endIcon={
            <Image
              src="/icons/frens_icon.svg"
              alt="Invite Friend Icon"
              boxSize="23px"
              mr={2}
            />
          }
        />
      </Grid>

      {/* PROFILE */}
      <GradientBorderWrapper
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
        w="360px"
        h="180px"
        mt="30px"
      >
        <Box w="100%" h="100%" borderRadius="12px" p={4} bg="transparent">
          <Flex>
            <Box mr={4} textAlign="center">
              <Avatar
                size="2xl"
                src={telegramUser?.photo_url}
                w="125px"
                h="125px"
                border="1px"
                borderColor="transparent"
                mb={1}
              />
              <Text
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontSize="15px"
                color={colors.primaryText}
              >
                {telegramUser?.username || "None"}
              </Text>
            </Box>

            <Stack spacing={5} mt={5}>
              <GradientBorderWrapper
                startColor="#793BC7"
                endColor="#C2D2FF"
                strokeWidth={1.5}
                w="165px"
                h="45px"
              >
                <Flex
                  align="center"
                  justify="left"
                  h="100%"
                  pl={4}
                  pr={4}
                  bg="transparent"
                  borderRadius="12px"
                >
                  <Image
                    src="/icons/star_icon.svg"
                    alt="Points Icon"
                    boxSize="23px"
                  />
                  <Stack spacing={0} ml={3}>
                    <Heading
                      fontSize="16px"
                      color={colors.primaryText}
                      fontFamily="'PixelifySans-Bold', sans-serif"
                      mb={-1.5}
                    >
                      {userInfo?.coins ?? 1}
                    </Heading>
                    <Text fontSize="12px" color={colors.secondaryText}>
                      Points
                    </Text>
                  </Stack>
                </Flex>
              </GradientBorderWrapper>

              <GradientBorderWrapper
                startColor="#793BC7"
                endColor="#C2D2FF"
                strokeWidth={1.5}
                w="165px"
                h="45px"
              >
                <Flex
                  align="center"
                  justify="left"
                  h="100%"
                  pl={4}
                  pr={4}
                  bg="transparent"
                  borderRadius="12px"
                >
                  <Image
                    src="/icons/star_icon.svg"
                    alt="Tickets Icon"
                    boxSize="23px"
                  />
                  <Stack spacing={0} ml={3}>
                    <Heading
                      fontSize="16px"
                      color={colors.primaryText}
                      fontFamily="'PixelifySans-Bold', sans-serif"
                      mb={-1.5}
                    >
                      {userInfo?.tickets ?? 1}
                    </Heading>
                    <Text fontSize="12px" color={colors.secondaryText}>
                      Tickets
                    </Text>
                  </Stack>
                </Flex>
              </GradientBorderWrapper>
            </Stack>
          </Flex>
        </Box>
      </GradientBorderWrapper>

      {/* INVENTORY AND STATS */}
      <Grid mt={30} gap={4} templateColumns="repeat(2, 1fr)">
        {/* Inventory */}
        <GradientBorderWrapper
          startColor="#793BC7"
          endColor="#C2D2FF"
          strokeWidth={1.5}
          w="165px"
          h="110px"
        >
          <Card
            onClick={() => {
              window.TgWebApp?.HapticFeedback.impactOccurred("soft");
              window.location.href = "/inventory";
            }}
            direction="row"
            alignItems="center"
            justifyContent="left"
            bg="transparent"
            h="100%"
            p={0.5}
            pl={5}
            pr={4}
          >
            <Image
              src="/icons/bag_icon.svg"
              alt="Inventory Icon"
              boxSize="40px"
              mr={2}
            />
            <Stack spacing={0}>
              <Heading
                fontSize="18px"
                color={colors.primaryText}
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontWeight="bold"
                mb={-1}
              >
                Inventory
              </Heading>
              <Text fontSize="10px" color={colors.secondaryText}>
                183 items
              </Text>
            </Stack>
          </Card>
        </GradientBorderWrapper>

        {/* Top */}
        <GradientBorderWrapper
          startColor="#793BC7"
          endColor="#C2D2FF"
          strokeWidth={1.5}
          w="165px"
          h="110px"
        >
          <Card
            onClick={() => {
              window.TgWebApp?.HapticFeedback.impactOccurred("soft");
              window.location.href = "/stats";
            }}
            direction="row"
            alignItems="center"
            justifyContent="left"
            bg="transparent"
            h="100%"
            p={0.5}
            pl={5}
            pr={4}
          >
            <Image
              src="/icons/star_icon.svg"
              alt="Top Icon"
              boxSize="40px"
              mr={2}
            />
            <Stack spacing={0}>
              <Heading
                fontSize="18px"
                color={colors.primaryText}
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontWeight="bold"
                mb={-1}
              >
                Top
              </Heading>
              <Text fontSize="10px" color={colors.secondaryText}>
                You are: 143
              </Text>
            </Stack>
          </Card>
        </GradientBorderWrapper>
      </Grid>
      {/* PLAY BTN */}
      <Box
        onClick={() => {
          window.location.href = "/game";
        }}
        mt={30}
        w="360px"
        h="185px"
        borderRadius="12px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        cursor="pointer"
        bg="transparent" // Прозрачный фон
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, #793BC7, #C2D2FF)",
          borderRadius: "12px",
          padding: "2px",
          backgroundClip: "padding-box",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        {/* Фоновый элемент с размытием */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(45deg, #151336, #2A266F)"
          bgSize="cover"
          bgPosition="center"
          filter="blur(6px)"
          zIndex="-1"
        />

        <Box
          as="img"
          src="/icons/jetpack.svg"
          alt="Flying Character"
          position="absolute"
          left="5px"
          bottom="0px"
          w="140px"
          filter="blur(2px)"
          animation={`${floatAnimation} 3s ease-in-out infinite`}
        />

        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          top="20px"
          right="50px"
          w="50px"
          filter="blur(1px)" // Размытие на звезде
          animation={`${floatAnimation} 4s ease-in-out infinite`}
        />
        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          bottom="20px"
          right="20px"
          w="70px"
          filter="blur(1px)"
          animation={`${floatAnimation} 2.5s ease-in-out infinite`}
        />
        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          top="50px"
          left="80px"
          w="45px"
          filter="blur(1px)"
          animation={`${floatAnimation} 3.5s ease-in-out infinite`}
        />
        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          bottom="40px"
          left="120px"
          w="20px"
          filter="blur(1px)"
          animation={`${floatAnimation} 2s ease-in-out infinite`}
        />
        {/* Добавление еще звезд для заполнения фона */}
        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          top="30px"
          left="140px"
          w="38px"
          filter="blur(1px)"
          animation={`${floatAnimation} 3s ease-in-out infinite`}
        />
        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          top="80px"
          right="120px"
          w="22px"
          filter="blur(1px)"
          animation={`${floatAnimation} 2.7s ease-in-out infinite`}
        />
        <Box
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          bottom="60px"
          right="150px"
          w="24px"
          filter="blur(1px)"
          animation={`${floatAnimation} 3.2s ease-in-out infinite`}
        />

        {/* Текст "PLAY" */}
        <Text
          fontSize="32px"
          color="white"
          fontFamily="'PixelifySans-Bold', sans-serif"
          zIndex="1"
          textAlign="center"
        >
          PLAY
        </Text>
      </Box>
    </Flex>
  );
};

export default Home;
