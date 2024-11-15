import { Box, Flex, Text, Icon} from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';

const Stats = () => {
  return (
    <Flex
      direction="column"
      align="center"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      minH="100vh"
      p={4}
      position="relative"
    >
      {/* Текст SOON и замочек по центру */}
      <Box textAlign="center" position="absolute" top="50%" transform="translateY(-50%)" zIndex="1">
        <Text fontSize="48px" fontFamily="'PixelifySans-Bold', sans-serif" mb={4}>
          SOON
        </Text>
        <Icon as={FiLock} boxSize="50px" />
      </Box>
    </Flex>
  );
};

export default Stats;
