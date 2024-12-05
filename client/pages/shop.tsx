import React, { useState, useEffect } from "react";
import { getShopItems, purchaseItem, ShopItem } from "../app/lib/api/shop";
import ItemPopup from "../app/components/ItemPopup";
import { useToast } from "@chakra-ui/react";
import { useStore } from "../app/lib/store/store";
import {
  Box,
  Flex,
  Text,
  Heading,
  Image,
  Grid,
} from "@chakra-ui/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import colors from "../theme/colors";
import { ButtonIfoLink } from "@/app/components/ButtonIfoLink";
import ShopItemPopup from "@/app/components/ShopItemPopup";
import { createPurchaseAttempt } from "@/app/lib/api/game";

const rarities = [
  { name: "All", color: "white.400", neon: "rgba(255, 255, 255, 0.8)" },
  { name: "Comon", color: "gray.400", neon: "rgba(128, 128, 128, 0.8)" },
  { name: "Rare", color: "blue.400", neon: "rgba(0, 122, 255, 0.8)" },
  { name: "Mythical", color: "purple.400", neon: "rgba(128, 0, 128, 0.8)" },
  { name: "Immortal", color: "yellow.400", neon: "rgba(255, 223, 0, 0.8)" },
  { name: "Infinite", color: "teal.400", neon: "rgba(0, 255, 212, 0.8)" },
];

const Shop: React.FC = () => {
  const userInfo = useStore((state) => state.user);
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    const response = await getShopItems();
    if (response.data) {
      setShopItems(response.data);
    }
  };

  const filteredItems = selectedRarity === "All" 
    ? shopItems 
    : shopItems.filter((item) => item.inventory_item.rarity === selectedRarity);

  const handleItemClick = (item: ShopItem) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handlePurchase = async (currency: string) => {
    if (!selectedItem) return;
    
    if (currency === 'stars') {
        const response = await createPurchaseAttempt({
            amount: selectedItem.star_price,
            description: selectedItem.inventory_item.name
        })
        if (response?.payment_url) {
            await window.Telegram.WebApp.openInvoice(response?.payment_url);
    
            const eventData: any = await new Promise((resolve, reject) => {
              const handler = (eventData) => {
                window.Telegram.WebApp.offEvent("invoiceClosed", handler);
                resolve(eventData);
              };
              window.Telegram.WebApp.onEvent("invoiceClosed", handler);
            });
    
    
            // React based on the payment status
            if (eventData.status === "paid") {
                toast({
                    title: "Success",
                    description: "Item purchased successfully",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top",
                  });
                  setIsPopupOpen(false);
                  fetchShopItems();
              return "ok";
            } else {
                toast({
                    title: "Error",
                    description: "Payment failed",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                    position: "top",
                  });
                  return "canceled";
            }
          }
    }

    const response = await purchaseItem({
      item_id: selectedItem.id,
      quantity: 1,
      currency
    });

    if (response.error) {
      toast({
        title: "Error",
        description: response.error,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } else {
      toast({
        title: "Success",
        description: "Item purchased successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsPopupOpen(false);
      fetchShopItems(); // Refresh shop items
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
    >
      <Heading
        fontSize="24px"
        fontFamily="'PixelifySans-Bold', sans-serif"
        mb={4}
      >
        Shop
      </Heading>

      <Flex gap={4} mb={6}>
        <ButtonIfoLink
          title={userInfo?.coins.toString() || "0"}
          width="100px"
          description="Points"
          onClick={() => {}}
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
          title={filteredItems.length.toString() || "0"}
          width="100px"
          description="Items"
          onClick={() => {}}
          startIcon={
            <Image
              src="/icons/shop_icon.svg"
              alt="Stars Icon"
              boxSize="23px"
              mr={2}
            />
          }
        />
      </Flex>

      <Flex
        overflowX="auto"
        gap={6}
        w="100%"
        mb={6}
        css={{
          "&::-webkit-scrollbar": {
            display: "none",
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

      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {filteredItems.map((item, index) => {
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
                <Flex gap={2} mt={1}>
                  {item.coin_price > 0 && (
                    <Text fontSize="12px" color="yellow.400">
                      {item.coin_price} P
                    </Text>
                  )}
                  {item.star_price > 0 && (
                    <Text fontSize="12px" color="blue.400">
                      {item.star_price} ⭐
                    </Text>
                  )}
                </Flex>
              </Flex>
            </GradientBorderWrapper>
          );
        })}
      </Grid>

      <ShopItemPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        item={selectedItem}
        onPurchase={handlePurchase}
      />
    </Flex>
  );
};

export default Shop; 