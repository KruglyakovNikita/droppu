import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Avatar,
  Stack,
  Image,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "../theme/colors";

const TopPage: React.FC = () => {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      const data = [
        { id: 1, username: "the_world_dawn", points: "4.5M", position: 1 },
        { id: 2, username: "hoangha_7979", points: "4.4M", position: 2 },
        { id: 3, username: "tema_ultra", points: "4.0M", position: 3 },
        { id: 4, username: "thucvn_egov", points: "3.8M", position: 4 },
        { id: 5, username: "SelectTarget", points: "3.2M", position: 5 },
      ];
      const user = { username: "a_yanushevich", points: "6,996", position: 21772629 };

      setTopUsers(data);
      setCurrentUser(user);
    };

    fetchTopUsers();
  }, []);

  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
      pb="80px" // Отступ для текущего пользователя и Navbar
    >
      {/* Заголовок */}
      <Flex align="center" mb={1}>
        <Image src="/icons/trophy.gif" alt="Trophy" boxSize="35px" />
        <Heading fontSize="24px" fontFamily="'PixelifySans-Bold', sans-serif">
          Leaderboard
        </Heading>
      </Flex>

      <Text
        fontSize="18px"
        fontFamily="'PixelifySans-Bold', sans-serif"
        mb={4}
        color={colors.secondaryText}
      >
        Total Users: 43,129,311
      </Text>

      {/* Список пользователей */}
      <Box w="100%" maxW="360px" h="calc(100vh - 200px)" overflowY="auto" mb={4} borderRadius="12px">
        <Stack spacing={4} pr={2}>
          {topUsers.map((user) => (
            <GradientBorderWrapper
              borderRadius={12}
              startColor="#793BC7"
              endColor="#C2D2FF"
              strokeWidth={1.5}
              key={user.id}
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
                      {user.points} PAWS
                    </Text>
                  </Stack>
                </Flex>
                {/* Позиция или GIF */}
                {user.position <= 3 ? (
                  <Image
                    src={`/icons//position_${user.position}.gif`}
                    alt={`Position ${user.position}`}
                    boxSize="40px"
                  />
                ) : (
                  <Text
                    fontFamily="'PixelifySans-Bold', sans-serif"
                    fontSize="16px"
                    color={colors.primaryText}
                  >
                    #{user.position}
                  </Text>
                )}
              </Flex>
            </GradientBorderWrapper>
          ))}
        </Stack>
      </Box>

      {/* Текущий пользователь */}
      {currentUser && (
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
                  {currentUser.username}
                </Text>
                <Text fontSize="14px" color="#FFE066">
                  {currentUser.points} PAWS
                </Text>
              </Stack>
            </Flex>
            <Text
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontSize="18px"
              color="#FFD700"
            >
              #{currentUser.position}
            </Text>
          </Flex>
        </GradientBorderWrapper>
      )}
    </Flex>
  );
};

export default TopPage;
