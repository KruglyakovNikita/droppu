import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Avatar,
  Stack,
  Image,
  Tabs,
  TabList,
  Tab,
  Skeleton
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "../theme/colors";
import { fetchLeaderboard } from "../app/lib/api/stats";

const periods = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "all_time", label: "All Time" },
];

const StatsPage: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<any | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetchLeaderboard(selectedPeriod);
        console.log('API Response:', response);
        if (response?.data) {
          setLeaderboardData(response.data);
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getLeaderboard();
  }, [selectedPeriod]);

  useEffect(() => {
    console.log('Leaderboard data updated:', leaderboardData);
  }, [leaderboardData]);

  const handleTabChange = (index: number) => {
    setSelectedPeriod(periods[index].id);
  };

  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
      pb="80px"
    >
      {/* Header */}
      <Flex align="center" mb={1}>
        <Image src="/icons/trophy.gif" alt="Trophy" boxSize="35px" />
        <Heading fontSize="24px" fontFamily="'PixelifySans-Bold', sans-serif">
          Leaderboard
        </Heading>
      </Flex>

      {/* Period Tabs */}
      <Tabs 
        onChange={handleTabChange} 
        variant="soft-rounded" 
        colorScheme="purple"
        mb={4}
      >
        <TabList>
          {periods.map((period) => (
            <Tab
              key={period.id}
              _selected={{ 
                color: colors.accent,
                bg: "rgba(255, 255, 255, 0.1)" 
              }}
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontSize="14px"
            >
              {period.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {/* Leaderboard List */}
      <Box w="100%" maxW="360px" h="calc(100vh - 250px)" overflowY="auto" mb={4}>
        <Stack spacing={4} pr={2}>
          {loading ? (
            // Skeleton loading state
            Array(5).fill(0).map((_, index) => (
              <GradientBorderWrapper key={index} borderRadius={12} startColor="#793BC7" endColor="#C2D2FF" strokeWidth={1.5}>
                <Flex bg="rgba(255, 255, 255, 0.05)" p={4} h="70px" align="center" justify="space-between" borderRadius="12px">
                  <Flex align="center">
                    <Skeleton w="32px" h="32px" mr={3} borderRadius="full" />
                    <Stack spacing={0}>
                      <Skeleton h="16px" w="120px" mb={2} />
                      <Skeleton h="12px" w="80px" />
                    </Stack>
                  </Flex>
                  <Skeleton h="24px" w="24px" />
                </Flex>
              </GradientBorderWrapper>
            ))
          ) : (
            leaderboardData?.leaderboard.map((user) => (
              <GradientBorderWrapper
                key={user.rank}
                borderRadius={12}
                startColor="#793BC7"
                endColor="#C2D2FF"
                strokeWidth={1.5}
              >
                <Flex
                  bg="rgba(255, 255, 255, 0.05)"
                  p={4}
                  h="70px"
                  align="center"
                  justify="space-between"
                  borderRadius="12px"
                >
                  <Flex align="center">
                    <Avatar
                      src="/icons/user_icon.svg"
                      size="sm"
                      mr={3}
                      bg="transparent"
                      border="1px solid white"
                    />
                    <Stack spacing={0}>
                      <Text
                        fontFamily="'PixelifySans-Bold', sans-serif"
                        fontSize="16px"
                        color={colors.primaryText}
                      >
                        {user.username}
                      </Text>
                      <Text fontSize="12px" color={colors.secondaryText}>
                        {user.score} points
                      </Text>
                    </Stack>
                  </Flex>
                  {user.rank <= 3 ? (
                    <Image
                      src={`/icons/position_${user.rank}.gif`}
                      alt={`Position ${user.rank}`}
                      boxSize="40px"
                    />
                  ) : (
                    <Text
                      fontFamily="'PixelifySans-Bold', sans-serif"
                      fontSize="16px"
                      color={colors.primaryText}
                    >
                      #{user.rank}
                    </Text>
                  )}
                </Flex>
              </GradientBorderWrapper>
            ))
          )}
        </Stack>
      </Box>

      {/* Current User */}
      {loading ? (
        <GradientBorderWrapper
          borderRadius={20}
          startColor="#FFD700"
          endColor="#FFAA00"
          strokeWidth={2}
          w="360px"
          position="fixed"
          bottom="110px"
          zIndex="10"
        >
          <Flex bg="rgba(255, 223, 0, 0.2)" p={4} h="65px" align="center" justify="space-between" borderRadius="20px">
            <Flex align="center">
              <Skeleton w="48px" h="48px" mr={3} borderRadius="full" />
              <Stack spacing={0}>
                <Skeleton h="18px" w="120px" mb={2} />
                <Skeleton h="14px" w="80px" />
              </Stack>
            </Flex>
            <Skeleton h="24px" w="24px" />
          </Flex>
        </GradientBorderWrapper>
      ) : (
        leaderboardData?.me && (
          <GradientBorderWrapper
            borderRadius={20}
            startColor="#FFD700"
            endColor="#FFAA00"
            strokeWidth={2}
            w="360px"
            position="fixed"
            bottom="110px"
            zIndex="10"
          >
            <Flex
              bg="rgba(255, 223, 0, 0.2)"
              p={4}
              h="65px"
              align="center"
              justify="space-between"
              borderRadius="20px"
            >
              <Flex align="center">
                <Avatar
                  src="/icons/user_icon.svg"
                  size="md"
                  mr={3}
                  bg="transparent"
                  border="2px solid #FFD700"
                />
                <Stack spacing={0}>
                  <Text
                    fontFamily="'PixelifySans-Bold', sans-serif"
                    fontSize="18px"
                    color="#FFD700"
                  >
                    {leaderboardData.me.username}
                  </Text>
                  <Text fontSize="14px" color="#FFE066">
                    {leaderboardData.me.score} points
                  </Text>
                </Stack>
              </Flex>
              <Text
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontSize="18px"
                color="#FFD700"
              >
                #{leaderboardData.me.rank}
              </Text>
            </Flex>
          </GradientBorderWrapper>
        )
      )}
    </Flex>
  );
};

export default StatsPage;
