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
  HStack,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "../theme/colors";
import { InventoryItem } from "../app/lib/api/inventory";
import { LockIcon } from "@chakra-ui/icons";
import { ButtonIfoLink } from "@/app/components/ButtonIfoLink";

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
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      toast({
        title: "Error fetching inventory",
        description:"An unexpected error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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

    try {
      const response = await equipItem(selectedItem.inventory_item.id);
      if (response.error) {
        throw new Error(response.error);
      }
      toast({
        isClosable: true,
        position: "top",
        title: "Item equipped successfully",
        status: "success",
        duration: 3000,
      });
      setIsPopupOpen(false);
    } catch (error) {
      toast({
        isClosable: true,
        position: "top",
        title: "Error",
        description: "Failed to equip item.",
        status: "error",
        duration: 3000,
      });
    }
  };

  const chanelLink = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred("soft");
  };

  // Адаптивные значения для разных размеров экрана
  const gridColumns = useBreakpointValue({ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" });
  const itemWidth = useBreakpointValue({ base: "140px", md: "150px" });
  const itemHeight = useBreakpointValue({ base: "120px", md: "130px" });
  const fontSize = useBreakpointValue({ base: "18px", md: "24px" });
  const buttonWidth = useBreakpointValue({ base: "90px", md: "100px" });
  const spacing = useBreakpointValue({ base: 3, md: 4 });
  const padding = useBreakpointValue({ base: 3, md: 4 });

  return (
    <>
      <Flex direction="column" align="center" color="white" minH="100vh" p={padding}>
        {/* Слайдер страниц */}
        <HStack spacing={spacing} mb={spacing} position="relative">
          <Text
            fontSize={fontSize}
            fontFamily="'PixelifySans-Bold', sans-serif"
            color={colors.primaryText}
            borderBottom="4px solid"
            borderColor="purple.500"
            pb={1}
          >
            Inventory
          </Text>
          <Flex align="center" opacity={0.5}>
            <Text
              fontSize={fontSize}
              fontFamily="'PixelifySans-Bold', sans-serif"
              color="gray.500"
              pb={1}
            >
              Shop
            </Text>
            <LockIcon ml={2} color="gray.500" />
          </Flex>
        </HStack>

        {/* Информация о монетах и предметах */}
        <Flex gap={spacing} mb={spacing}>
          <ButtonIfoLink
            title={isLoading ? "..." : userInfo?.coins.toString() || "0"}
            width={buttonWidth}
            description="Points"
            onClick={chanelLink}
            startIcon={
              <Image
                src="/icons/star_icon.svg"
                alt="Points Icon"
                boxSize={useBreakpointValue({ base: "20px", md: "23px" })}
                mr={2}
              />
            }
          />
          <ButtonIfoLink
            title={isLoading ? "..." : inventoryItems.length.toString()}
            width={buttonWidth}
            description="Items"
            onClick={chanelLink}
            startIcon={
              <Image
                src="/icons/bag_icon.svg"
                alt="Bag Icon"
                boxSize={useBreakpointValue({ base: "20px", md: "23px" })}
                mr={2}
              />
            }
          />
        </Flex>

        {/* Навбар редкостей */}
        <Flex
          overflowX="auto"
          gap={useBreakpointValue({ base: 4, md: 6 })}
          w="100%"
          mb={spacing}
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {rarities.map((rarity) => (
            <Box key={rarity.name} textAlign="center">
              <Text
                fontSize={useBreakpointValue({ base: "16px", md: "20px" })}
                fontFamily="'PixelifySans-Bold', sans-serif"
                cursor="pointer"
                color={colors.primaryText}
                onClick={() => setSelectedRarity(rarity.name)}
                position="relative"
                px={0}
                whiteSpace="nowrap"
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
        <Grid templateColumns={gridColumns} gap={spacing}>
          {isLoading
            ? Array(6).fill(0).map((_, index) => (
                <Skeleton
                  key={index}
                  height={itemHeight}
                  width={itemWidth}
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
                      p={3}
                      h={itemHeight}
                      w={itemWidth}
                      bg="transparent"
                      borderRadius="12px"
                      position="relative"
                    >
                      <Box
                        position="absolute"
                        bottom="35px"
                        width={useBreakpointValue({ base: "60px", md: "70px" })}
                        height={useBreakpointValue({ base: "60px", md: "70px" })}
                        borderRadius="50%"
                        bg={rarity?.neon}
                        filter="blur(10px)"
                        zIndex={0}
                      />
                      <Image
                        src={`https://droppu.ru:7777/api/v1/uploads/${item.inventory_item.image_url}`}
                        alt={item.inventory_item.name}
                        boxSize={useBreakpointValue({ base: "70px", md: "80px" })}
                        objectFit="contain"
                        mb={0}
                        zIndex={1}
                      />
                      <Text 
                        fontSize={useBreakpointValue({ base: "11px", md: "12px" })} 
                        color={colors.secondaryText}
                        textAlign="center"
                        mt={1}
                      >
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
