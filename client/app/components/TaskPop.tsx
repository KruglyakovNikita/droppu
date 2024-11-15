import { Box, Flex, Button, Text, Image, Heading } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import colors from "@/theme/colors";
import GradientBorderWrapper from "./GradientBorderWrapper";

const TaskPop = ({
  icon,
  reward,
  name,
  description,
  button1Text,
  button1Link,
  button2Text,
  onCheck,
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            margin: "0",
            width: "100%",
            height: "400px",
            borderRadius: "55px 55px 0 0",
            backgroundColor: colors.cardBackground,
            boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            zIndex: 1000, // Обеспечивает отображение поверх других элементов
          }}
        >
          <GradientBorderWrapper
            startColor="#793BC7"
            endColor="#C2D2FF"
            strokeWidth={2.5}
            style={{
              borderRadius: "56px 56px 0 0",
              width: "100%",
              height: "100%",
            }}
          >
            {/* Кнопка закрытия */}
            <Flex justify="flex-end">
              <Button
                onClick={onClose}
                variant="ghost"
                fontSize="20px"
                mr={4}
                color={colors.primaryText}
                _hover={{ color: "gray.500" }}
              >
                ✕
              </Button>
            </Flex>

            {/* Содержимое компонента */}
            <Flex direction="column" align="center" p={6}>
              <Image src={icon} alt="Reward Icon" boxSize="60px" mb={3} />
              <Text fontSize="24px" color={colors.accent} fontWeight="bold">
                +{reward} Points
              </Text>
              <Heading
                fontSize="22px"
                fontFamily="'PixelifySans-Bold', sans-serif"
                textAlign="center"
                color={colors.primaryText}
                mt={2}
                mb={0}
              >
                {name}
              </Heading>
              <Text
                fontSize="14px"
                color={colors.secondaryText}
                textAlign="center"
                mb={6}
              >
                {description}
              </Text>

              <Flex gap={3}>
                {/* Первая кнопка - ссылка */}
                <Button
                  as="a"
                  onClick={onCheck}
                  target="_blank"
                  rel="noopener noreferrer"
                  border="1px solid white"
                  borderRadius="20px"
                  minWidth="110px"
                  height="35px"
                  bg="transparent"
                  fontSize="14px"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  color={colors.primaryText}
                >
                  {button1Text}
                </Button>

                {/* Вторая кнопка - функция проверки */}
                <Button
                  onClick={onCheck}
                  border="1px solid white"
                  borderRadius="20px"
                  minWidth="110px"
                  height="35px"
                  bg="transparent"
                  fontSize="14px"
                  _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  color={colors.primaryText}
                >
                  {button2Text}
                </Button>
              </Flex>
            </Flex>
          </GradientBorderWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskPop;
