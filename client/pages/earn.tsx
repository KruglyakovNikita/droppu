import { Box, Flex, Grid, Text, Heading, Button, Stack, Image } from '@chakra-ui/react';
import colors from '../theme/colors';
import GradientBorderWrapper from '../app/components/GradientBorderWrapper';
import { keyframes } from '@emotion/react';

interface TaskCardProps {
  title: string;
  points: number;
}

const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(10deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

export default function Earn() {
  return (
    <Flex
      direction="column"
      align="center" // Центрирование основного содержимого
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
    >

      {/* Заголовок Weekly */}
      <Box w="90%" maxW="360px" alignSelf="flex-start" mb={4}>
        <Heading
          fontSize="20px"
          fontFamily="'PixelifySans-Bold', sans-serif"
          fontWeight="bold"
          textAlign="left"
          ml={3}
        >
          Weekly
        </Heading>
      </Box>

      {/* Карточка Earn for checking socials */}
      <GradientBorderWrapper
        width="360px"
        height="110px"
        borderRadius={12}
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
      >
      {/* Размытый фон */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="transparent"
        backdropFilter="blur(6px)"
        zIndex="-1"
      />

      {/* Плавающие звездочки */}
      {Array.from({ length: 10 }).map((_, index) => (
        <Box
          key={index}
          as="img"
          src="/icons/star.svg"
          alt="Star"
          position="absolute"
          top={`${Math.random() * 50}%`}
          left={`${Math.random() * 90}%`}
          w={`${10 + Math.random() * 50}px`}
          animation={`${floatAnimation} ${2 + Math.random() * 3}s ease-in-out infinite`}
          opacity={0.5 + Math.random() * 0.5}
          filter="blur(1px)"
        />
      ))}

      {/* Информация о задании */}
      <Box
        position="relative"
        zIndex="1"
        display="flex"
        flexDirection="column"
        alignItems="left"
        justifyContent="start"
        height="100%"
        px="6"
        mt="4"
      >
        <Text
          fontSize="20px"
          fontFamily="'PixelifySans-Bold', sans-serif"
          color={colors.primaryText}
          textAlign="left"
        >
          Earn for checking socials
        </Text>
        <Text
          fontSize="14px"
          fontFamily="'PixelifySans-Bold', sans-serif"
          color={colors.secondaryText}
          mt="-1"
        >
          300 Points
        </Text>
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
          Start
        </Button>
        </Box>
      </GradientBorderWrapper>

      {/* Навигационная панель */}
      <Flex w="90%" maxW="500px" justify="space-around" alignSelf="flex-start" mb={4} mt="4">
        {["New", "Socials", "Frens", "Farming"].map((item) => (
          <Text
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontSize="20px"
            fontWeight="bold"
            ml="3"
            p="1.5"
            color={colors.primaryText}
            key={item}
            _after={{ content: item === "New" || item === "Socials" ? "'*'" : "''", color: "#FF00FF", ml: "2px" }}
          >
            {item}
          </Text>
        ))}
      </Flex>
      
      {/* Список заданий */}
      <Grid templateColumns="1fr" gap={4} w="100%" maxW="360px" >
        {[
          { title: "Subscribe on Telegram", points: 300 },
          { title: "Subscribe on YouTube", points: 300 },
          { title: "Follow Blum on TikTok", points: 300 },
          { title: "Subscribe on Telegram", points: 300 },
          { title: "Subscribe on Telegram", points: 300 }
        ].map((task, index) => (

          <GradientBorderWrapper
            borderRadius={12}
            startColor="#793BC7"
            endColor="#C2D2FF"
            strokeWidth={1.5}
            key={index}
            
          >
            <Flex
              bg="transparent"
              borderRadius="12px"
              p={4}
              h="50px"
              align="center"
              justify="space-between"
            >
              <Flex align="center">
                <Image src="/icons/star_icon.svg" alt="Task Icon" boxSize="23px" mr={3} />
                <Stack spacing={0}>
                  <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="16px">
                    {task.title}
                  </Text>
                  <Text fontSize="12px" color={colors.secondaryText}>
                    {task.points} Points
                  </Text>
                </Stack>
              </Flex>
              <Button
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
                Start
              </Button>
            </Flex>
          </GradientBorderWrapper>
        ))}
      </Grid>
    </Flex>
  );
};

