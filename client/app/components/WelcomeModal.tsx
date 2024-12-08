import React, { useState, useEffect, FC } from "react";
import { keyframes } from "@emotion/react";
import { Box, Flex, Text, Button, Image, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store/store";
import colors from "../../theme/colors";
import GradientBorderWrapper from "@/app/components/GradientBorderWrapper";
import { FirstLoginInfo } from "../lib/store/types";
import { useRouter } from "next/router";

const fadeInOut = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const slideIn = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  50% { transform: translateX(-5%); opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
`;

const MotionBox = Box;

interface WelcomeModalProps {
  data: FirstLoginInfo;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ data }) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const [currentTopic, setCurrentTopic] = useState(0);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const topics = [
    "Sign up and come to the droppu world",
    "Explore unique features",
    "Level up and grow your potential",
  ];

  const bonuses = [
    {
      icon: "/icons/premium.gif",
      title: "Telegram Premium",
      points: "300 points",
      visible: data?.is_premium || true,
    },
    {
      icon: "/icons/account_age.gif",
      title: `Account age ${data?.years_telegram || 0}`,
      points: "400 points",
      visible: true,
    },
    {
      icon: "/icons/welcome.gif",
      title: "Welcome Bonus",
      points: "400 points 3 tickets",
      visible: true,
    },
  ];

  useEffect(() => {
    setNavbarVisible(false);
    return () => setNavbarVisible(true);
  }, [setNavbarVisible]);

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setCurrentTopic((prev) => (prev + 1) % topics.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [step, topics.length]);

  const handleNextPage = () => {
    setStep(2);
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      bg="#0d0a33"
      color={colors.primaryText}
      minH="100vh"
      textAlign="center"
      px={6}
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
    >
      {step === 1 && (
        <>
          {/* Animated Logo */}
          <MotionBox
            as={motion.div}
            animation={`${fadeInOut} 3s infinite`}
            mb={6}
            display="flex"
            justifyContent="center"
          >
            <Image
              src="/icons/logo.png" // Replace with your logo path
              alt="Droppu Logo"
              w="120px"
              h="120px"
            />
          </MotionBox>

          {/* Main Title */}
          <Text
            fontSize="2xl"
            fontFamily="'PixelifySans-Bold', sans-serif"
            mb={1}
            color={colors.secondaryText}
            fontWeight="bold"
          >
            Welcome to DROPPU
          </Text>

          {/* Rotating Topics */}
          <MotionBox
            as={motion.div}
            animation={`${slideIn} 4s`}
            key={currentTopic}
            fontSize="lg"
            fontFamily="'PixelifySans-Regular', sans-serif"
            mb={4}
          >
            {topics[currentTopic]}
          </MotionBox>

          {/* Dots Indicator */}
          <Flex justify="center" mb={8}>
            {topics.map((_, index) => (
              <Box
                key={index}
                w="10px"
                h="10px"
                bg={currentTopic === index ? "gray.300" : "gray.600"}
                borderRadius="full"
                mx={1}
              />
            ))}
          </Flex>

          {/* Next Button */}
          <Button
            onClick={handleNextPage}
            mt="3"
            height="50px"
            width="250px"
            border="2px solid white"
            borderRadius="52px"
            bg="transparent"
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontWeight="bold"
            fontSize="24px"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            color={colors.primaryText}
          >
            LETS GO
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          {/* Bonuses Section */}
          <Stack spacing={6} w="100%">
            {bonuses
              .filter((bonus) => bonus.visible)
              .map((bonus, index) => (
                <GradientBorderWrapper
                  key={index}
                  align="center"
                  justify="space-between"
                  w="100%"
                  startColor="#793BC7"
                  endColor="#C2D2FF"
                  strokeWidth={1.5}
                  bg="rgba(255, 255, 255, 0.05)"
                  borderRadius={12}
                  p={4}
                >
                  <Flex align="center" w="100%">
                    <Image
                      src={bonus.icon}
                      width="64px"
                      height="64px"
                      mr={4}
                      animation={`${fadeInOut} 3s infinite`}
                    />
                    <Flex w="100%" direction="column">
                      <Text
                        fontSize="24px"
                        fontWeight="bold"
                        fontFamily="'PixelifySans-Bold', sans-serif"
                        textAlign="left"
                      >
                        {bonus.title}
                      </Text>
                      <Text
                        fontSize="16px"
                        color={colors.secondaryText}
                        fontFamily="'PixelifySans-Regular', sans-serif"
                        textAlign="left"
                      >
                        {bonus.points}
                      </Text>
                    </Flex>
                  </Flex>
                </GradientBorderWrapper>
              ))}
          </Stack>

          {/* Buttons */}
          <Flex mt={16} gap={6} w="100%" align="center">
            <Button
              mt="3"
              height="40px"
              width="280px"
              border="2px solid white"
              borderRadius="52px"
              bg="transparent"
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontWeight="bold"
              fontSize="24px"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              color={colors.primaryText}
            >
              SHARE
            </Button>
            <Button
              onClick={() => router.push("/")}
              mt="3"
              height="40px"
              width="280px"
              border="2px solid white"
              borderRadius="52px"
              bg="transparent"
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontWeight="bold"
              fontSize="24px"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              color={colors.primaryText}
            >
              CLAIM
            </Button>
          </Flex>
        </>
      )}
    </Flex>
  );
};

export default WelcomeModal;
