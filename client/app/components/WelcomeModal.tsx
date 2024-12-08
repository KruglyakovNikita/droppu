import React, { useState, useEffect, FC } from "react";
import { keyframes } from "@emotion/react";
import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store/store";
import colors from "../../theme/colors";
import GradientBorderWrapper from "@/app/components/GradientBorderWrapper";
import { FirstLoginInfo } from "../lib/store/types";
import { useRouter } from "next/router";

const fadeInOutLogo = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const fadeInOutText = keyframes`
  0% { opacity: 0.1; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

const slideIn = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  50% { transform: translateX(-5%); opacity: 1; }
  100% { transform: translateX(0); opacity: 1; }
`;

const MotionBox = Box;

interface WelcomeModalProps {
  data: FirstLoginInfo;
  onClose: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ data, onClose }) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const [currentTopic, setCurrentTopic] = useState(0);
  const [step, setStep] = useState(1);
  const firstLoginInfo = useStore((state) => state.firstLoginInfo);
  const [bonuses] = useState([
    {
      icon: "/icons/premium.gif",
      title: "Telegram Premium",
      coins: `+${firstLoginInfo?.premium_coins ?? 0} coins`,
      visible: firstLoginInfo?.is_premium || true,
    },
    {
      icon: "/icons/account_age.gif",
      title: `Account age: ${firstLoginInfo?.years_telegram || 0}`,
      coins: `+${firstLoginInfo?.premium_coins ?? 0} coins`,
      visible: true,
    },
    {
      icon: "/icons/welcome.gif",
      title: "Welcome Bonus",
      coins: `+${firstLoginInfo?.welcome_coins ?? 0} coins`,
      tickets: `+${firstLoginInfo?.welcome_tickets || 0} tickets`,
      visible: true,
    },
  ]);

  const router = useRouter();
  const topics = [
    "Sign up and come to the droppu world",
    "Explore unique features",
    "Level up and grow your potential",
  ];

  useEffect(() => {
    setNavbarVisible(false);
    return () => setNavbarVisible(true);
  }, [setNavbarVisible]);

  useEffect(() => {
    if (step === 1) {
      const interval = setInterval(() => {
        setCurrentTopic((prev) => (prev + 1) % topics.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [step, topics.length]);

  const handleNextPage = () => {
    setStep(2);
  };

  const onCloseHandler = () => {
    onClose();
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      color={colors.primaryText}
      minH="100vh"
      textAlign="center"
      px={6}
    >
      {step === 1 && (
        <>
          {/* Animated Logo */}
          <MotionBox
            as={motion.div}
            animation={`${fadeInOutLogo} 3s infinite`}
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
            textColor="#CD53FC"
          >
            Welcome to DROPPU
          </Text>

          {/* Rotating Topics */}
          <MotionBox
            as={motion.div}
            animation={`${fadeInOutText} 2s infinite`}
            mb={6}
            display="flex"
            justifyContent="center"
            fontSize="lg"
            fontFamily="'PixelifySans-Regular', sans-serif"
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
            NEXT
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
                <Flex
                  key={index}
                  align="center"
                  justify="space-between"
                  w="100%"
                  flexDirection="column"
                  gap={4}
                >
                  <Flex align="center" w="100%">
                    <Image src={bonus.icon} width="64px" height="64px" mr={4} />
                    <Flex
                      w="100%"
                      direction="column"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Text
                        fontSize={{ base: "24px", sm: "28px" }}
                        fontWeight="bold"
                        fontFamily="'PixelifySans-Bold', sans-serif"
                        textAlign="left"
                      >
                        {bonus.title}
                      </Text>
                      <Flex alignItems="center" justifyContent="center" gap={2}>
                        <Text
                          fontSize="16px"
                          color={colors.secondaryText}
                          fontFamily="'PixelifySans-Regular', sans-serif"
                          textAlign="left"
                        >
                          {bonus.coins}
                        </Text>

                        {bonus.tickets ? (
                          <Divider
                            orientation="vertical"
                            color="black"
                            height="15px"
                            width="1px"
                          />
                        ) : null}
                        {bonus.tickets ? (
                          <Text
                            fontSize="16px"
                            color={colors.secondaryText}
                            fontFamily="'PixelifySans-Regular', sans-serif"
                            textAlign="left"
                          >
                            {bonus.tickets}
                          </Text>
                        ) : null}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Divider />
                </Flex>
              ))}
          </Stack>

          {/* Buttons */}
          <Flex
            marginTop="8rem"
            gap={6}
            w="100%"
            alignItems="center"
            justifyContent="center"
          >
            <Button
              onClick={onCloseHandler}
              mt="3"
              height="40px"
              width="230px"
              border="2px solid white"
              borderRadius="52px"
              bg="transparent"
              fontFamily="'PixelifySans-Bold', sans-serif"
              fontWeight="bold"
              fontSize="24px"
              _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
              color={colors.primaryText}
              padding="20px"
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
