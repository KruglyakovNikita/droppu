import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Stack,
  Button,
  Image,
  Heading,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "@/theme/colors";
import { useStore } from "../app/lib/store/store";
import {
  getPendingRewards,
  claimRewards,
  getReferralsList,
} from "../app/lib/api/referrals";
import { ReferralUser } from "../app/lib/store/types";

export default function Invites() {
  const userInfo = useStore((state) => state.user);
  const [pendingRewards, setPendingRewards] = useState({
    total_coins: 0,
    total_tickets: 0,
  });
  const [friends, setFriends] = useState<ReferralUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsResponse, friendsResponse] = await Promise.all([
        getPendingRewards(),
        getReferralsList(),
      ]);

      if (rewardsResponse?.data) {
        setPendingRewards(rewardsResponse.data);
      }
      if (friendsResponse?.data) {
        setFriends(friendsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleClaim = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await claimRewards();
      await fetchData(); // Refresh data after claiming
      window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
    } catch (error) {
      console.error("Error claiming rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const inviteFriendsLink = () => {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("soft");
    window.Telegram.WebApp.openTelegramLink(
      `https://t.me/share/url?url=https://t.me/DroppuBot/app?startapp=${userInfo?.tg_id}&text=%0A%0A🚀 Jump into action with @Droppu's jetpack game and earn $JET tokens soon!%0A🌟 Get a 750 rating boost just for joining!%0A💥 Premium players score a massive 1000 rating boost!`
    );
  };
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

  const StatsSkeleton = () => (
    <Flex w="full" justify="space-around" mb={1} gap={5}>
      {[1, 2, 3].map((_, index) => (
        <GradientBorderWrapper
          key={index}
          startColor="#793BC7"
          endColor="#C2D2FF"
          strokeWidth={1.5}
          w="95px"
          h="45px"
        >
          <Flex align="center" justify="left" h="100%" pl={2} pr={4}>
            <Skeleton boxSize="23px" />
            <Stack spacing={0} ml={1}>
              <Skeleton h="16px" w="30px" mb={1} />
              <Skeleton h="12px" w="40px" />
            </Stack>
          </Flex>
        </GradientBorderWrapper>
      ))}
    </Flex>
  );

  const FriendsListSkeleton = () => (
    <Stack spacing={4} w="100%">
      {[1, 2, 3].map((_, index) => (
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
            <SkeletonCircle size="30px" mr={4} />
            <Stack spacing={0}>
              <Skeleton h="16px" w="80px" mb={1} />
              <Skeleton h="12px" w="60px" />
            </Stack>
          </Flex>
          <Stack spacing={0}>
            <Skeleton h="16px" w="40px" mb={1} />
            <Skeleton h="12px" w="30px" />
          </Stack>
        </Flex>
      ))}
    </Stack>
  );

  return (
    <Flex
      direction="column"
      align="center"
      color="white"
      minH="100vh"
      maxH="100vh"
      overflowY="auto"
      p={[2, 4]}
      pb="calc(var(--tg-viewport-stable-height) * 0.15 + 10px)"
      position="relative"
      css={{
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '2px',
        },
      }}
    >
      <Heading
        fontSize={["20px", "24px"]}
        fontFamily="'PixelifySans-Bold', sans-serif"
        mb={[2, 4]}
      >
        Invite Friends
      </Heading>

      {/* Карточка со статистикой */}
      <GradientBorderWrapper
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
        w={["90%", "100%"]}
        maxW="360px"
        h="130px"
        p={["12px", "16px"]}
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={3}
        mx={2}
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
          {isInitialLoading ? (
            <>
              <StatsSkeleton />
              <Skeleton h="25px" w="70px" mt="3" />
            </>
          ) : (
            <>
              <Flex w="full" justify="space-around" mb={1} gap={[2, 5]}>
                {[
                  { label: "Points", value: pendingRewards.total_coins.toString() },
                  {
                    label: "Tickets",
                    value: pendingRewards.total_tickets.toString(),
                  },
                  { label: "Frens", value: friends.length.toString() },
                ].map((stat, index) => (
                  <GradientBorderWrapper
                    key={index}
                    startColor="#793BC7"
                    endColor="#C2D2FF"
                    strokeWidth={1.5}
                    w={["85px", "95px"]}
                    h={["40px", "45px"]}
                  >
                    <Flex
                      align="center"
                      justify="left"
                      h="100%"
                      pl={[1, 2]}
                      pr={[2, 4]}
                      bg="transparent"
                      borderRadius="12px"
                    >
                      <Image
                        src="/icons/star_icon.svg"
                        alt="Tickets Icon"
                        boxSize={["20px", "23px"]}
                      />
                      <Stack spacing={0} ml={[0.5, 1]}>
                        <Heading
                          fontSize={["14px", "16px"]}
                          color={colors.primaryText}
                          fontFamily="'PixelifySans-Bold', sans-serif"
                          mb={-1.5}
                        >
                          {stat.value}
                        </Heading>
                        <Text fontSize={["10px", "12px"]} color={colors.secondaryText}>
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
                onClick={handleClaim}
                isDisabled={
                  pendingRewards.total_coins === 0 &&
                  pendingRewards.total_tickets === 0
                }
                isLoading={loading}
              >
                Claim
              </Button>
            </>
          )}
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
      {isInitialLoading ? (
        <Box w="100%" maxW="360px" flex="1" overflowY="auto" mb={4} maxH={300}>
          <FriendsListSkeleton />
        </Box>
      ) : friends.length > 0 ? (
        // Friends List
        <Box w="100%" maxW="360px" flex="1" overflowY="auto" mb={4} maxH={300}>
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
                      {friend.username}
                    </Text>
                    <Text fontSize="12px" color={colors.secondaryText}>
                      +{friend.indirect_referrals_count} refs
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
                    {friend.total_earned}
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
      <Box
        position="fixed"
        bottom="calc(var(--tg-viewport-stable-height) * 0.15 + 10px)"
        left="50%"
        transform="translateX(-50%)"
        w="full"
        display="flex"
        justifyContent="center"
        zIndex="2"
        pb={4}
      >
        <GradientBorderWrapper
          startColor="#793BC7"
          endColor="#C2D2FF"
          strokeWidth={1.5}
          w={["180px", "200px"]}
          h={["45px", "50px"]}
        >
          <Flex
            onClick={inviteFriendsLink}
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            bg="transparent"
            h="100%"
            p={0.5}
            pl={[2, 4]}
          >
            <Stack spacing={0}>
              <Heading
                fontSize={["16px", "18px"]}
                color={colors.primaryText}
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontWeight="bold"
                mb={-1}
              >
                Invite Friends
              </Heading>
              <Text fontSize={["9px", "10px"]} color={colors.secondaryText}>
                Get more tickets and points
              </Text>
            </Stack>
            <Image
              src="/icons/frens_icon.svg"
              alt="Invite Friend Icon"
              boxSize={["25px", "30px"]}
              mr={[1, 2]}
            />
          </Flex>
        </GradientBorderWrapper>
      </Box>
    </Flex>
  );
}
