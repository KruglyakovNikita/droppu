import React, { useState, useEffect } from "react";
import { getInventory, equipItem } from "../app/lib/api/inventory";
import ItemPopup from "../app/components/ItemPopup";
import { useToast } from "@chakra-ui/react";
import { useStore } from "../app/lib/store/store";
import {
  Box,
  Flex,
  Text,
  Heading,
  Stack,
  Image,
  Grid,
  Skeleton,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "../theme/colors";
import { ButtonIfoLink } from "@/app/components/ButtonIfoLink";
import { InventoryItem } from "../app/lib/api/inventory";

// Редкости
const rarities = [
  { name: "All", color: "white.400", neon: "rgba(255, 255, 255, 0.8)" },
  { name: "Comon", color: "gray.400", neon: "rgba(128, 128, 128, 0.8)" },
  { name: "Rare", color: "blue.400", neon: "rgba(0, 122, 255, 0.8)" },
  { name: "Mythical", color: "purple.400", neon: "rgba(128, 0, 128, 0.8)" },
  { name: "Immortal", color: "yellow.400", neon: "rgba(255, 223, 0, 0.8)" },
  { name: "Infinite", color: "teal.400", neon: "rgba(0, 255, 212, 0.8)" },
];

const Inventory: React.FC = () => {
  const userInfo = useStore((state) => state.user);
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const response = await getInventory();
      if (response.data) {
        setInventoryItems(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems =
    selectedRarity === "All"
      ? inventoryItems
      : inventoryItems.filter(
          (item) => item.inventory_item.rarity === selectedRarity
        );

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handleEquip = async () => {
    if (!selectedItem) return;

    const response = await equipItem(selectedItem.inventory_item.id);
    if (response.error) {
      toast({
        isClosable: true,
        position: "top",
        title: "Error",
        description: response.error,
        status: "error",
        duration: 3000,
      });
    } else {
      toast({
        isClosable: true,
        position: "top",
        title: "Item equipped successfully",
        status: "success",
        duration: 3000,
      });
      setIsPopupOpen(false);
    }
  };

  const chanelLink = () => {
    window.Telegram.WebApp.HapticFeedback.impactOccurred("soft");
  };

  return (
    <>
      <Flex direction="column" align="center" color="white" minH="100vh" p={4}>
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
            title={isLoading ? "..." : userInfo?.coins.toString() || "0"}
            width="100px"
            description="Points"
            onClick={chanelLink}
            startIcon={
              <Image
                src="/icons/star_icon.svg"
                alt="Points Icon"
                boxSize="23px"
                mr={2}
              />
            }
          />
          <ButtonIfoLink
            title="Shop"
            width="100px"
            description="Buy items"
            onClick={() => (window.location.href = "/shop")}
            startIcon={
              <Image
                src="/icons/shop_icon.svg"
                alt="Shop Icon"
                boxSize="23px"
                mr={2}
              />
            }
          />
          <ButtonIfoLink
            title={isLoading ? "..." : inventoryItems.length.toString()}
            width="100px"
            description="Items"
            onClick={chanelLink}
            startIcon={
              <Image
                src="/icons/bag_icon.svg"
                alt="Bag Icon"
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
                whiteSpace="nowrap" // Убираем перенос ткста
                _after={{
                  content: '""',
                  position: "absolute",
                  bottom: "-5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  height: "5px",
                  background:
                    selectedRarity === rarity.name ? rarity.neon : "none",
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
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          {isLoading
            ? // Skeleton loading state
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <Skeleton
                    key={index}
                    height="130px"
                    width="150px"
                    borderRadius="12px"
                    startColor="#1a1a1a"
                    endColor="#2d2d2d"
                  />
                ))
            : filteredItems.map((item, index) => {
                const rarity = rarities.find(
                  (r) => r.name === item.inventory_item.rarity
                );
                return (
                  <GradientBorderWrapper
                    key={index}
                    borderRadius={12}
                    startColor="#793BC7"
                    endColor="#C2D2FF"
                    strokeWidth={1.5}
                    onClick={() => handleItemClick(item)}
                  >
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      p={4}
                      h="130px"
                      w="150px"
                      bg="transparent"
                      borderRadius="12px"
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        bottom="35px"
                        width="70px"
                        height="70px"
                        borderRadius="50%"
                        bg={rarity?.neon}
                        filter="blur(10px)"
                        zIndex={0}
                      />
                      <Image
                        src={`https://droppu.ru:7777/api/v1/uploads/${item.inventory_item.image_url}`}
                        alt={item.inventory_item.name}
                        boxSize="80px"
                        objectFit="contain"
                        mb={0}
                        zIndex={1}
                      />
                      <Text fontSize="12px" color={colors.secondaryText}>
                        {item.inventory_item.name}
                      </Text>
                    </Flex>
                  </GradientBorderWrapper>
                );
              })}
        </Grid>
      </Flex>

      <ItemPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        item={selectedItem}
        onEquip={handleEquip}
      />
    </>
  );
};

export default Inventory;
