import { Box, Flex, Avatar, Text, Grid, 
  Card, CardHeader, CardBody, CardFooter,
  Stack,
  Button, Image,
  Heading
 } from "@chakra-ui/react";
export default function Invites() {
  return (
    <Flex
    direction="column"
    align="center"
    bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
    color="white"
    minH="100vh"
    p={4}
  >
    {/* Заголовок */}
    <Heading fontSize="32px" fontFamily="'PixelifySans-Bold', sans-serif" mb={6}>
      Invite Friends
    </Heading>

    {/* Карточка со статистикой */}
    <Box
      w="90%"
      maxW="360px"
      borderRadius="12px"
      p="16px"
      bgGradient="linear(45deg, #793BC7, #C2D2FF)"
      display="flex"
      flexDirection="column"
      alignItems="center"
      mb={6}
      position="relative"
    >
      <Box
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.4)"
        borderRadius="12px"
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Flex w="full" justify="space-around" mb={4}>
          {[
            { label: "Points", value: "1234967" },
            { label: "Tickets", value: "123" },
            { label: "Frens", value: "12" }
          ].map((stat, index) => (
            <Box
              key={index}
              borderRadius="12px"
              p="1px"
              bgGradient="linear(45deg, #793BC7, #C2D2FF)"
              w="100px"
              h="45px"
            >
              <Flex
                bg="rgba(0, 0, 0, 0.5)"
                borderRadius="12px"
                h="100%"
                align="center"
                justify="center"
                flexDirection="column"
              >
                <Image src="/icons/star_icon.svg" alt={stat.label} boxSize="20px" mb={1} />
                <Text fontSize="14px" fontFamily="'PixelifySans-Bold', sans-serif">{stat.value}</Text>
                <Text fontSize="10px" color="#B0AEE0">{stat.label}</Text>
              </Flex>
            </Box>
          ))}
        </Flex>
        <Button
          mt={3}
          border="1px solid white"
          borderRadius="8px"
          bg="transparent"
          fontFamily="'PixelifySans-Bold', sans-serif"
          fontSize="14px"
          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
        >
          Claim
        </Button>
      </Box>
    </Box>

    {/* Блок с описанием */}
    <Text fontSize="14px" color="#B0AEE0" textAlign="center" maxW="360px" mb={6}>
      Score 10% from buddies <br /> Plus an extra 8.5% from their referrals
    </Text>

    {/* Список друзей */}
    <Stack spacing={4} w="90%" maxW="360px" mb={6}>
      {[...Array(5)].map((_, index) => (
        <Flex
          key={index}
          borderRadius="20px"
          bg="rgba(0, 0, 0, 0.4)"
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
              <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="14px">NoName</Text>
              <Text fontSize="12px" color="#B0AEE0">+10</Text>
            </Stack>
          </Flex>
          <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="16px">
            123486 Points
          </Text>
        </Flex>
      ))}
    </Stack>

    {/* Кнопка Invite Friend */}
    <Box
      w="90%"
      maxW="360px"
      borderRadius="12px"
      p="1px"
      bgGradient="linear(45deg, #793BC7, #C2D2FF)"
    >
      <Flex
        bg="rgba(0, 0, 0, 0.5)"
        borderRadius="12px"
        align="center"
        justify="space-between"
        p={3}
      >
        <Stack spacing={0}>
          <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="16px">
            Invite Friend
          </Text>
          <Text fontSize="10px" color="#B0AEE0">
            Get more tickets and points
          </Text>
        </Stack>
        <Image
          src="/icons/frens_icon.svg"
          alt="Invite Friend Icon"
          boxSize="23px"
          mr={2}
        />
      </Flex>
    </Box>
  </Flex>
  );
}
