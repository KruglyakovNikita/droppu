import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  Stack,
  Image,
  Grid,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "../theme/colors";
import { ButtonIfoLink } from "@/app/components/ButtonIfoLink";

// Редкости
const rarities = [
  { name: "Comon", color: "gray.400", neon: "rgba(128, 128, 128, 0.8)" },
  { name: "Rare", color: "blue.400", neon: "rgba(0, 122, 255, 0.8)" },
  { name: "Mythical", color: "purple.400", neon: "rgba(128, 0, 128, 0.8)" },
  { name: "Immortal", color: "yellow.400", neon: "rgba(255, 223, 0, 0.8)" },
  { name: "Infinite", color: "teal.400", neon: "rgba(0, 255, 212, 0.8)" },
];

// Данные для предметов
const items = [
  { name: "Item 1", rarity: "Comon", icon: "/icons/jetpack.svg" },
  { name: "Item 2", rarity: "Rare", icon: "/icons/jetpack.svg" },
  { name: "Item 3", rarity: "Mythical", icon: "/icons/jetpack.svg" },
  { name: "Item 4", rarity: "Immortal", icon: "/icons/jetpack.svg" },
  { name: "Item 5", rarity: "Infinite", icon: "/icons/jetpack.svg" },
  { name: "Item 11", rarity: "Comon", icon: "/icons/jetpack.svg" },
  { name: "Item 21", rarity: "Rare", icon: "/icons/jetpack.svg" },
  { name: "Item 31", rarity: "Mythical", icon: "/icons/jetpack.svg" },
  { name: "Item 41", rarity: "Immortal", icon: "/icons/jetpack.svg" },
  { name: "Item 51", rarity: "Infinite", icon: "/icons/jetpack.svg" },
  { name: "Item 12", rarity: "Comon", icon: "/icons/jetpack.svg" },
  { name: "Item 22", rarity: "Rare", icon: "/icons/jetpack.svg" },
  { name: "Item 32", rarity: "Mythical", icon: "/icons/jetpack.svg" },
  { name: "Item 42", rarity: "Immortal", icon: "/icons/jetpack.svg" },
  { name: "Item 52", rarity: "Infinite", icon: "/icons/jetpack.svg" },
];

const Inventory: React.FC = () => {
  const [selectedRarity, setSelectedRarity] = useState("Comon");

  const chanelLink = () => {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("soft");
  };

  // Фильтруем предметы по редкости
  const filteredItems = items.filter(
    (item) => item.rarity === selectedRarity
  );

  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
    >
      {/* Заголовок */}
      <Heading
        fontSize="24px"
        fontFamily="'PixelifySans-Bold', sans-serif"
        mb={4}

      >
        Inventory
      </Heading>

      {/* Информация о монетах и предметах */}
      <Flex gap={4} mb={6}>
        <ButtonIfoLink
          title="1000"
          width="100px"
          description="Points"
          onClick={chanelLink}
          startIcon={
            <Image
              src="/icons/star_icon.svg"
              alt="Tribes Icon"
              boxSize="23px"
              mr={2}
            />
          }
        />
        <ButtonIfoLink
          title="123"
          width="100px"
          description="Items"
          onClick={chanelLink}
          startIcon={
            <Image
              src="/icons/bag_icon.svg"
              alt="Tribes Icon"
              boxSize="23px"
              mr={2}
            />
          }
        />
      </Flex>

      {/* Навбар редкостей */}
      <Flex
        overflowX="auto" // Включаем горизонтальный скролл
        gap={6}
        w="100%" // Указываем ширину Flex
        mb={6}
        css={{
          "&::-webkit-scrollbar": {
            display: "none", // Убираем стандартный скроллбар
          },
        }}
      >
        {rarities.map((rarity) => (
          <Box key={rarity.name} textAlign="center">
            <Text
              fontSize="20px"
              fontFamily="'PixelifySans-Bold', sans-serif"
              cursor="pointer"
              color={colors.primaryText}
              onClick={() => setSelectedRarity(rarity.name)}
              position="relative"
              px={0} // Увеличиваем кликабельную область
              whiteSpace="nowrap" // Убираем перенос текста
              _after={{
                content: '""',
                position: "absolute",
                bottom: "-5px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                height: "5px",
                background: selectedRarity === rarity.name ? rarity.neon : "none",
                filter: "blur(6px)",
                borderRadius: "8px",
              }}
            >
              {rarity.name}
            </Text>
          </Box>
        ))}
      </Flex>

      {/* Сетка предметов */}
      <Grid templateColumns="repeat(4, 1fr)" gap={6}>
        {filteredItems.map((item, index) => {
          const rarity = rarities.find((r) => r.name === item.rarity);
          return (
            <GradientBorderWrapper
              key={index}
              borderRadius={12}
              startColor="#793BC7"
              endColor="#C2D2FF"
              strokeWidth={1.5}
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                p={4}
                h="75px"
                w="80px"
                bg="transparent"
                borderRadius="12px"
                position="relative"
              >
                <Box
                  position="absolute"
                  bottom="10px"
                  width="50px"
                  height="50px"
                  borderRadius="50%"
                  bg={rarity?.neon}
                  filter="blur(10px)"
                  zIndex={0}
                />
                <Image
                  src={item.icon}
                  alt={item.name}
                  boxSize="40px"
                  mb={0}
                  zIndex={1}
                />
                <Text fontSize="12px" color={colors.secondaryText}>
                  {item.name}
                </Text>
              </Flex>
            </GradientBorderWrapper>
          );
        })}
      </Grid>
    </Flex>
  );
};

export default Inventory;
