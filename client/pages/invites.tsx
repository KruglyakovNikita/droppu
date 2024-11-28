import {
  Box,
  Flex,
  Text,
  Stack,
  Button,
  Image,
  Heading,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "@/theme/colors";
import { useStore } from "../app/lib/store/store";


export default function Invites() {
  const userInfo = useStore((state) => state.user);

  const inviteFriendsLink = () => {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("soft");
    window.Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=https://t.me/DroppuBot/start?startapp=${userInfo?.tg_id}&text=%0A%0A🚀 Jump into action with @Droppu's jetpack game and earn $JET tokens soon!%0A🌟 Get a 750 rating boost just for joining!%0A💥 Premium players score a massive 1000 rating boost!`
    );
  };
  const friends = [
    // { name: "Alice", points: 1200 },
    // { name: "Bob", points: 850 },
    // { name: "Charlie", points: 950 },
  ];
  const steps = [
    {
      title: "Share your referral link",
      subtitle: "Get a points and tickets for each friend",
    },
    {
      title: "Your friends join DROPPU",
      subtitle: "And start farming points",
    },
    {
      title: "Receive 10% from friends",
      subtitle: "Plus an additional 2.5% from their referrals",
    },
  ];

  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
      position="relative"
    >
      {/* Заголовок */}
      <Heading
        fontSize="24px"
        fontFamily="'PixelifySans-Bold', sans-serif"
        mb={4}
      >
        Invite Friends
      </Heading>

      {/* Карточка со статистикой */}
      <GradientBorderWrapper
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
        w="100%"
        maxW="360px"
        h="130px"
        p="16px"
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={3}
        position="relative"
      >
        <Box
          w="100%"
          h="100%"
          borderRadius="12px"
          p={1.5}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Flex w="full" justify="space-around" mb={1} gap={5}>
            {[
              { label: "Points", value: "12349" },
              { label: "Tickets", value: "123" },
              { label: "Frens", value: "12" },
            ].map((stat, index) => (
              <GradientBorderWrapper
                key={index}
                startColor="#793BC7"
                endColor="#C2D2FF"
                strokeWidth={1.5}
                w="95px"
                h="45px"
              >
                <Flex
                  align="center"
                  justify="left"
                  h="100%"
                  pl={2}
                  pr={4}
                  bg="transparent"
                  borderRadius="12px"
                >
                  <Image
                    src="/icons/star_icon.svg"
                    alt="Tickets Icon"
                    boxSize="23px"
                  />
                  <Stack spacing={0} ml={1}>
                    <Heading
                      fontSize="16px"
                      color={colors.primaryText}
                      fontFamily="'PixelifySans-Bold', sans-serif"
                      mb={-1.5}
                    >
                      {stat.value}
                    </Heading>
                    <Text fontSize="12px" color={colors.secondaryText}>
                      {stat.label}
                    </Text>
                  </Stack>
                </Flex>
              </GradientBorderWrapper>
            ))}
          </Flex>
          <Button
            mt="3"
            height="25px"
            width="70px"
            border="1px solid white"
            borderRadius="52px"
            bg="transparent"
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontWeight="normal"
            fontSize="14px"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            color={colors.primaryText}
          >
            Claim
          </Button>
        </Box>
      </GradientBorderWrapper>

      {/* Блок с описанием */}
      <Text
        fontSize="12px"
        color={colors.secondaryText}
        textAlign="center"
        maxW="360px"
        mb={4}
      >
        Score 10% from buddies <br /> Plus an extra 8.5% from their referrals
      </Text>

      {/* Conditional Rendering of Friends List or Steps */}
      {friends.length > 0 ? (
        // Friends List
        <Box
          w="100%"
          maxW="360px"
          flex="1"
          overflowY="auto"
          mb={4}
          maxH={300}
        >
          <Stack spacing={4} w="100%">
            {friends.map((friend, index) => (
              <Flex
                key={index}
                borderRadius="12px"
                h="60px"
                bg={colors.frensPlateBackground}
                align="center"
                justify="space-between"
                p={4}
                px={6}
              >
                <Flex align="center">
                  <Box
                    w="30px"
                    h="30px"
                    bgGradient="linear(45deg, #793BC7, #C2D2FF)"
                    borderRadius="full"
                    mr={4}
                  />
                  <Stack spacing={0}>
                    <Text
                      fontFamily="'PixelifySans-Bold', sans-serif"
                      fontSize="16px"
                      mb={-2}
                    >
                      {friend.name}
                    </Text>
                    <Text fontSize="12px" color={colors.secondaryText}>
                      +10
                    </Text>
                  </Stack>
                </Flex>
                <Stack spacing={0}>
                  <Text
                    fontFamily="'PixelifySans-Bold', sans-serif"
                    fontSize="16px"
                    color={colors.primaryText}
                    mb={-2}
                  >
                    {friend.points}
                  </Text>
                  <Text
                    fontFamily="'PixelifySans-Bold', sans-serif"
                    fontSize="12px"
                    color={colors.secondaryText}
                  >
                    points
                  </Text>
                </Stack>
              </Flex>
            ))}
          </Stack>
        </Box>
      ) : (
        // Steps when Friends List is empty
        <Box w="100%" maxW="360px" mb={4}>
          <Heading
            fontSize="20px"
            fontFamily="'PixelifySans-Bold', sans-serif"
            mb={4}
            textAlign="center"
          >
            How it works
          </Heading>
          <Stack spacing={6}>
            {steps.map((step, index) => (
              <Flex key={index} align="center">
                <Box
                  minW="30px"
                  h="30px"
                  bgGradient="linear(45deg, #793BC7, #C2D2FF)"
                  borderRadius="full"
                  mr={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="16px" fontWeight="bold">
                    {index + 1}
                  </Text>
                </Box>
                <Stack spacing={0}>
                  <Text
                    fontFamily="'PixelifySans-Bold', sans-serif"
                    fontSize="16px"
                  >
                    {step.title}
                  </Text>
                  <Text fontSize="12px" color={colors.secondaryText}>
                    {step.subtitle}
                  </Text>
                </Stack>
              </Flex>
            ))}
          </Stack>
        </Box>
      )}

      {/* Кнопка Invite Friend */}
      <GradientBorderWrapper
        position="fixed"
        bottom="120px"
        left="50%"
        transform="translateX(-50%)"
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
        w="200px"
        h="50px"
        zIndex="2"
      >
        <Flex
          onClick={inviteFriendsLink}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          bg="transparent"
          h="100%"
          p={0.5}
          pl={4}
        >
          <Stack spacing={0}>
            <Heading
              fontSize="18px"
              color={colors.primaryText}
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontWeight="bold"
              mb={-1}
            >
              Invite Friends
            </Heading>
            <Text fontSize="10px" color={colors.secondaryText}>
              Get more tickets and points
            </Text>
          </Stack>
          <Image
            src="/icons/frens_icon.svg"
            alt="Invite Friend Icon"
            boxSize="30px"
            mr={2}
          />
        </Flex>
      </GradientBorderWrapper>
    </Flex>
  );
}
