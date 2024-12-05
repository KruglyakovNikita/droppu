import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Image,
  Button,
  VStack,
} from "@chakra-ui/react";
import colors from "../../theme/colors";
import GradientBorderWrapper from "./GradientBorderWrapper";

interface ShopItemPopupProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onPurchase: (currency: string) => void;
}

const ShopItemPopup: React.FC<ShopItemPopupProps> = ({
  isOpen,
  onClose,
  item,
  onPurchase,
}) => {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent
        bg="rgba(13, 20, 120, 0.9)"
        borderRadius="20px"
        mx={4}
      >
        <ModalHeader 
          color={colors.primaryText} 
          fontFamily="'PixelifySans-Bold', sans-serif"
        >
          {item.inventory_item.name}
        </ModalHeader>
        <ModalCloseButton color={colors.primaryText} />
        <ModalBody>
          <VStack spacing={4} pb={6}>
            <Image
              src={`https://droppu.ru:7777/api/v1/uploads/${item.inventory_item.animation_url || item.inventory_item.image_url}`}
              alt={item.inventory_item.name}
              maxH="200px"
              objectFit="contain"
              mb={4}
            />
            <Text color={colors.secondaryText}>
              {item.inventory_item.description}
            </Text>
              {item.coin_price > 0 && (
                <Button
                  onClick={() => onPurchase('coins')}
                  border="1px solid white"
                  borderRadius="20px"
                  minWidth="110px"
                  height="35px"
                  bg="transparent"
                  fontSize="14px"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  color={colors.primaryText}
                  fontFamily="'PixelifySans-Bold', sans-serif"
                >
                  Buy for {item.coin_price} Points
                </Button>
              )}
            {item.star_price > 0 && (
                <Button
                  onClick={() => onPurchase('stars')}
                  border="1px solid white"
                  borderRadius="20px"
                  minWidth="110px"
                  height="35px"
                  bg="transparent"
                  fontSize="14px"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  color={colors.primaryText}
                  fontFamily="'PixelifySans-Bold', sans-serif"
                >
                  Buy for {item.star_price} Stars
                </Button>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShopItemPopup; 