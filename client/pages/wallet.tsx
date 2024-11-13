import colors from '@/theme/colors';
import { Box, Flex, Heading, Text, Icon, IconButton, Stack, Button, Select } from '@chakra-ui/react';
import { FiMenu, FiBell, FiArrowUpRight, FiArrowDownLeft, FiDollarSign, FiLock } from 'react-icons/fi';

const Wallet = () => {
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
      {/* Слой с размытым контентом */}
      <Box
        w="full"
        h="full"
        position="absolute"
        top="0"
        left="0"
        filter="blur(20px)" // Применяем сильное размытие
        zIndex="1"
      >
        {/* Контент с балансом и токенами под размитием */}
        <Flex
          direction="column"
          align="center"
          minH="100vh"
          w="full"
          p={4}
        >
        

          {/* Карточка с балансом */}
          <Box
            w="90%"
            maxW="400px"
            borderRadius="20px"
            p={6}
            mt={110}
            bg="rgba(0, 0, 0, 0.6)"
            backdropFilter="blur(10px)"
            textAlign="center"
            mb={8}
          >
            <Text fontSize="14px" color="gray.300" mb={2}>
              Available balance
            </Text>
            <Heading fontSize="48px" fontFamily="'PixelifySans-Bold', sans-serif" color={colors.primaryText}>
              $6,500
            </Heading>
            <Select
              mt={4}
              placeholder="metamask"
              variant="unstyled"
              textAlign="center"
              color="white"
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="full"
              w="50%"
              mx="auto"
              _hover={{ bg: "rgba(255, 255, 255, 0.3)" }}
            />

            {/* Кнопки действия */}
            <Flex justify="space-around" mt={6}>
              <Stack align="center">
                <Icon as={FiArrowUpRight} boxSize="6" color="gray.300" />
                <Text fontSize="12px" color="gray.300">Send</Text>
              </Stack>
              <Stack align="center">
                <Icon as={FiArrowDownLeft} boxSize="6" color="gray.300" />
                <Text fontSize="12px" color="gray.300">Receive</Text>
              </Stack>
              <Stack align="center">
                <Icon as={FiDollarSign} boxSize="6" color="gray.300" />
                <Text fontSize="12px" color="gray.300">Buy</Text>
              </Stack>
            </Flex>
          </Box>

          {/* Секция с токенами */}
          <Box w="full" maxW="400px" px={4}>
            <Text fontSize="16px" fontFamily="'PixelifySans-Bold', sans-serif" mb={4}>
              Tokens
            </Text>
            <Flex direction="row" wrap="wrap" justify="space-between">
              {[1, 2].map((_, index) => (
                <Box
                  key={index}
                  w="48%"
                  bg="rgba(0, 0, 0, 0.6)"
                  borderRadius="12px"
                  p={4}
                  mb={4}
                  textAlign="left"
                >
                  <Flex align="center" justify="space-between">
                    <Stack spacing={0}>
                      <Text fontSize="14px" fontWeight="bold">
                        USD Coin
                      </Text>
                      <Text fontSize="12px" color="green.400">
                        +22.4% in 30m
                      </Text>
                    </Stack>
                    <Icon as={FiDollarSign} boxSize="5" color="yellow.300" />
                  </Flex>
                  <Text fontSize="14px" mt={2}>$45,875.98</Text>
                  <Text fontSize="12px" color="red.400">-12.77% (20)</Text>
                  <Flex justify="space-around" mt={3}>
                    <Button size="xs" variant="outline" borderRadius="full" color="white" borderColor="rgba(255, 255, 255, 0.2)">
                      30m
                    </Button>
                    <Button size="xs" variant="outline" borderRadius="full" color="white" borderColor="rgba(255, 255, 255, 0.2)">
                      1h
                    </Button>
                    <Button size="xs" variant="outline" borderRadius="full" color="white" borderColor="rgba(255, 255, 255, 0.2)">
                      1d
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Текст Wallet наверху */}
      <Heading
        fontSize="24px"
        fontFamily="'PixelifySans-Bold', sans-serif"

        position="absolute"
        top="20px"
        textAlign="center"
        zIndex="1"
      >
        Wallet
      </Heading>

      {/* Текст SOON и замочек по центру */}
      <Box textAlign="center" position="absolute" top="50%" transform="translateY(-50%)" zIndex="1">
        <Text fontSize="48px" fontFamily="'PixelifySans-Bold', sans-serif" mb={4}>
          SOON
        </Text>
        <Icon as={FiLock} boxSize="50px" />
      </Box>
    </Flex>
  );
};

export default Wallet;
