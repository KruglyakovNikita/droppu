import React, { useEffect, FC } from "react";
import { Box, Flex, Text, Button, Image, Stack } from "@chakra-ui/react";
import { useStore } from "..//lib/store/store";
import colors from "../../theme/colors";
import { CheckInInfo } from "../lib/store/types";
import { useRouter } from "next/router";
import { ButtonIfoLink } from "@/app/components/ButtonIfoLink";

interface CheckInModalProps {
  data: CheckInInfo;
  onClose: () => void;
}


const Modal: FC<CheckInModalProps> = ({ data, onClose }) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const router = useRouter();

  useEffect(() => {
    setNavbarVisible(false);
    return () => setNavbarVisible(true);
  }, [setNavbarVisible]);

  const handleNextPage = () => {
    router.push("/");
    onClose();
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
      <Image
        src="/icons/calendar.gif"
        alt="Calendar Animation"
        boxSize="150px"
        mb={16}
      />
      <Text
        fontFamily="'PixelifySans-Bold', sans-serif"
        fontSize="32px"
        fontWeight="bold"
        color={colors.primaryText}
        mb={10}
      >
        Your Daily Reward
      </Text>
      <Stack direction="row" spacing={10} mb={10}>
      <ButtonIfoLink
            title={data.check_in_coins.toString()}
            width="100px"
            description="Points"
            onClick={() => {}}
            descriptionFontSize="14px"
            startIcon={
              <Image
                src="/icons/star_icon.svg"
                alt="Points Icon"
                boxSize="20px"
                mr={2}
              />
            }
          />

        <ButtonIfoLink
            title={data.check_in_tickets.toString()}
            width="100px"
            description="Tickets"
            onClick={() => {}}
            descriptionFontSize="14px"
            startColor="#C2D2FF"
            endColor="#793BC7"
            startIcon={
              <Image
                src="/icons/star_icon.svg"
                alt="Points Icon"
                boxSize="20px"
                mr={2}
              />
            }
          />
      </Stack>
      <Text
        lineHeight="22px"
        fontSize="22px"
        color={colors.secondaryText}
        mb={10}
        px={4}
      >
        Come back tomorrow to reach day {data.check_in_days + 1} check-in. Hint: Skipping a day will reset all progress.
      </Text>
      <Button
            onClick={handleNextPage}
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
  );
};

export default Modal;
