import React, { FC, ReactNode } from "react";
import GradientBorderWrapper from "./GradientBorderWrapper";
import { Card, Heading, Stack, Text } from "@chakra-ui/react";
import colors from "@/theme/colors";

interface ButtonIfoLinkProps {
  title: string;
  description: string;
  onClick: () => void;
  startIcon?: ReactNode;
  width?: string;
  endIcon?: ReactNode;
  descriptionFontSize?: string;
  titleFontSize?: string;
  startColor?: string;
  endColor?: string;
}

export const ButtonIfoLink: FC<ButtonIfoLinkProps> = ({
  description,
  title,
  onClick,
  startIcon,
  endIcon,
  width="165px",
  descriptionFontSize = "9px",
  titleFontSize = "14px",
  startColor="#793BC7",
  endColor="#C2D2FF",
}) => {
  return (
    <GradientBorderWrapper
      startColor={startColor}
      endColor={endColor}
      strokeWidth={1.5}
      w={width}
      h="45px"
    >
      <Card
        onClick={onClick}
        direction="row"
        bg="transparent"
        h="100%"
        w="100%"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
      >
        {startIcon ? startIcon : null}
        <Stack spacing={0}>
          <Heading
            fontSize={titleFontSize}
            color={colors.primaryText}
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontWeight="bold"
            mb={-1.5}
          >
            {title}
          </Heading>
          <Text fontSize={descriptionFontSize} color={colors.secondaryText}>
            {description}
          </Text>
        </Stack>
        {endIcon ? endIcon : null}
      </Card>
    </GradientBorderWrapper>
  );
};
