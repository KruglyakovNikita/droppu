import { Box, Flex, Text, Stack, Button, Image, Heading } from "@chakra-ui/react";
import GradientBorderWrapper from '../app/components/GradientBorderWrapper';
import colors from "@/theme/colors";
import WebApp from '@twa-dev/sdk';


export default function Invites() {
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
      <Heading fontSize="24px" fontFamily="'PixelifySans-Bold', sans-serif" mb={4}>
        Invite Friends
      </Heading>

      {/* Карточка со статистикой */}
      <GradientBorderWrapper
        borderRadius={12}
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
              { label: "Frens", value: "12" }
            ].map((stat, index) => (
              <GradientBorderWrapper
                key={index}
                borderRadius={12}
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
      <Text fontSize="12px" color={colors.secondaryText} textAlign="center" maxW="360px" mb={4}>
        Score 10% from buddies <br /> Plus an extra 8.5% from their referrals
      </Text>

      {/* Контейнер для списка друзей с ограниченной высотой и прокруткой */}
      <Box w="100%" maxW="360px" flex="1" overflowY="auto" mb={4} maxH={300} borderRadius={12}>
        <Stack spacing={4} w="100%">
          {[...Array(10)].map((_, index) => (
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
                  <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="16px" mb={-2}>NoName</Text>
                  <Text fontSize="12px" color={colors.secondaryText}>+10</Text>
                </Stack>
              </Flex>
              <Stack spacing={0}>
                <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="16px" color={colors.primaryText} mb={-2}>
                  123486
                </Text>
                <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="12px" color={colors.secondaryText}>
                  points
                </Text>
              </Stack>
            </Flex>
          ))}
        </Stack>
      </Box>

      {/* Кнопка Invite Friend */}
      <GradientBorderWrapper
        position="fixed"
        bottom="120px"
        left="50%"
        transform="translateX(-50%)"
        borderRadius={12}
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
        w="165px"
        h="45px"
        zIndex="2"
      >
        <Flex
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
              fontSize="16px"
              color={colors.primaryText}
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontWeight="bold"
              mb={-1.5}
            >
              Invite Friend
            </Heading>
            <Text fontSize="8px" color={colors.secondaryText}>
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
      </GradientBorderWrapper>
    </Flex>
  );
}
