import React, { FC, ReactNode } from 'react'
import GradientBorderWrapper from './GradientBorderWrapper'
import { Card, Heading, Stack, Text } from '@chakra-ui/react';
import colors from '@/theme/colors';

interface ButtonIfoLinkProps{
    title:string;
    description:string
    onClick:()=>void
    startIcon?:ReactNode
    endIcon?:ReactNode;
    descriptionFontSize?:string
    titleFontSize?:string
}

export const ButtonIfoLink:FC<ButtonIfoLinkProps> = ({description,title,onClick,startIcon,endIcon,descriptionFontSize='9px',titleFontSize='14px'}) => {
  return (
    <GradientBorderWrapper
    borderRadius={12}
    startColor="#793BC7"
    endColor="#C2D2FF"
    strokeWidth={1.5}
    w="165px"
    h="45px"
  >
    <Card
      onClick={onClick}
      direction="row"
      bg="transparent"
      h="100%"
      w='100%'
      display='flex'
      flexDirection='row'
       alignItems="center"
      justifyContent="center"
    >
      {startIcon?startIcon:null}
      <Stack spacing={0}>
        <Heading
          fontSize={titleFontSize}
          color={colors.primaryText}
          fontFamily="'PixelifySans-Bold', sans-serif"
          fontWeight="bold"
          mb={-1.25}
        >
          {title}
        </Heading>
        <Text fontSize={descriptionFontSize} color={colors.secondaryText}>
          {description}
        </Text>
      </Stack>
      {endIcon?endIcon:null}
    </Card>
  </GradientBorderWrapper>
  )
}
