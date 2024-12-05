import React, { useState, useEffect } from "react";
import { Flex, Box, Text, Image, Progress } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { keyframes } from "@emotion/react";

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const MotionBox = motion.create(Box as any);

const LoadingScreen = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = [
    "Sign up and come to the droppu world",
    "Explore unique features",
    "Level up and grow your potential",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prevStep) => (prevStep + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="#0d0a33"
      color="white"
      minH="100vh"
      textAlign="center"
    >
      {/* Лого с анимацией затухания */}
      <MotionBox
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Box
          bgGradient="linear(to-r, #7f2dfb, #8f55ff)"
          borderRadius="full"
          w="120px"
          h="120px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb={4}
        >
          <Text fontSize="4xl" fontWeight="bold" fontFamily="'PixelifySans-Bold', sans-serif">
            D
          </Text>
        </Box>
      </MotionBox>

      {/* Текст заголовка */}
      <Text fontSize="2xl" fontFamily="'PixelifySans-Bold', sans-serif" mb={4}>
        Welcome to droppu
      </Text>

      {/* Меняющийся текст */}
      <Text
        fontSize="lg"
        fontFamily="'PixelifySans-Regular', sans-serif"
        mb={8}
      >
        {steps[currentStep]}
      </Text>

      {/* Иконки смены шагов */}
      <Flex justify="center" mb={8}>
        {steps.map((_, index) => (
          <Box
            key={index}
            w="10px"
            h="10px"
            bg={currentStep === index ? "gray.300" : "gray.600"}
            borderRadius="full"
            mx={1}
          />
        ))}
      </Flex>

      {/* Прогресс бар */}
      <Text mb={2} fontFamily="'PixelifySans-Regular', sans-serif">
        Loading...
      </Text>
      <Progress
        value={(currentStep + 1) * (100 / steps.length)}
        w="80%"
        size="xs"
        colorScheme="blue"
        borderRadius="full"
      />
    </Flex>
  );
};

export default LoadingScreen;
