import React, { useState, useEffect, FC } from "react";
import { keyframes } from "@emotion/react";
import { Box, Flex, Text, Button, Image, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useStore } from "../lib/store/store";
import colors from "../../theme/colors";
import { CheckInInfo } from "../lib/store/types";
import { useRouter } from "next/router";

interface CheckInModalProps {
  data: CheckInInfo;
}

const CheckInModal: FC<CheckInModalProps> = ({ data }) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const router = useRouter();

  useEffect(() => {
    setNavbarVisible(false);
    return () => setNavbarVisible(true);
  }, [setNavbarVisible]);

  const handleNextPage = () => {
    router.push("/");
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
      <>
        <h1>LET GOOGOGOGOGO</h1>
        <h1>CHECK IN</h1>

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
    </Flex>
  );
};

export default CheckInModal;
