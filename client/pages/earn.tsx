import { Box, Flex, Grid, Text, Heading, Button, Stack, Image } from '@chakra-ui/react';
import colors from '../theme/colors';

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
          fontSize="32px"
          fontFamily="'PixelifySans-Bold', sans-serif"
          textAlign="left" // Выровнен по левому краю
        >
          Weekly
        </Heading>
      </Box>

      {/* Карточка Earn for checking socials */}
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
          textAlign="center"
        >
          <Text fontSize="18px" fontFamily="'PixelifySans-Bold', sans-serif">
            Earn for checking socials
          </Text>
          <Button
            mt={3}
            border="1px solid white"
            borderRadius="8px"
            bg="transparent"
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontSize="14px"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          >
            Check
          </Button>
        </Box>
      </Box>

      {/* Навигационная панель */}
      <Flex w="90%" maxW="500px" justify="space-around" alignSelf="flex-start" mb={4}>
        {["New", "Socials", "Frens", "Farming"].map((item) => (
          <Text
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontSize="16px"
            color="white"
            key={item}
            _after={{ content: item === "New" || item === "Socials" ? "'*'" : "''", color: "#FF00FF", ml: "2px" }}
          >
            {item}
          </Text>
        ))}
      </Flex>
      
      {/* Список заданий */}
      <Grid templateColumns="1fr" gap={4} w="90%" maxW="360px">
        {[
          { title: "Subscribe on Telegram", points: 300 },
          { title: "Subscribe on YouTube", points: 300 },
          { title: "Follow Blum on TikTok", points: 300 },
          { title: "Subscribe on Telegram", points: 300 },
          { title: "Subscribe on Telegram", points: 300 }
        ].map((task, index) => (
          <Box
            key={index}
            borderRadius="12px"
            p="1px"
            bgGradient="linear(45deg, #793BC7, #C2D2FF)"
          >
            <Flex
              bg="rgba(0, 0, 0, 0.5)"
              borderRadius="12px"
              p={4}
              align="center"
              justify="space-between"
            >
              <Flex align="center">
                <Image src="/icons/star_icon.svg" alt="Task Icon" boxSize="23px" mr={3} />
                <Stack spacing={0}>
                  <Text fontFamily="'PixelifySans-Bold', sans-serif" fontSize="16px">
                    {task.title}
                  </Text>
                  <Text fontSize="12px" color="#B0AEE0">
                    {task.points} Points
                  </Text>
                </Stack>
              </Flex>
              <Button
                size="sm"
                border="1px solid white"
                borderRadius="8px"
                bg="transparent"
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontSize="14px"
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              >
                Start
              </Button>
            </Flex>
          </Box>
        ))}
      </Grid>
    </Flex>
  );
};

