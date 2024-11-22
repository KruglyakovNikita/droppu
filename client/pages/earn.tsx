import {
  Box,
  Flex,
  Grid,
  Text,
  Heading,
  Button,
  Stack,
  Image,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import GradientBorderWrapper from "../app/components/GradientBorderWrapper";
import TaskPopup from "../app/components/TaskPop";
import { useEffect, useState } from "react";
import colors from "../theme/colors";
import { getTasks, completeTask } from "../app/lib/api/tasks"; 
import { useStore } from "../app/lib/store/store"; 

const floatAnimation = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(10deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const Earn: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("New");
  const [isRewardPopupOpen, setIsRewardPopupOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const toast = useToast();


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getTasks();
        if (response?.data) {
          setTasks(response.data);
          filterTasks("New", response.data);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  const filterTasks = (category: string, taskList = tasks) => {
    setSelectedCategory(category);
    const filtered = taskList.filter((task) => task.type === category);
    setFilteredTasks(filtered);
  };

  const openRewardPopup = (task: any) => {
    setSelectedTask(task);
    setIsRewardPopupOpen(true);
    setIsLoading(false);
    setIsChecked(false);
  };

  const closeRewardPopup = () => setIsRewardPopupOpen(false);

  const handleSubscribe = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsChecked(true);
    }, 6000);
  };

  // Handle the Check button click
  const handleCheck = () => {
    if (selectedTask.category == 'New' || selectedTask.category == 'Socials'){
      closeRewardPopup();
      completeTask(selectedTask.id);

      toast({
        title: "Task complete!",
        description: `You completed the task "${selectedTask.name}"`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    else{
      toast({
        title: "Task not complete!",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
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
      {/* Weekly Header */}
      <Box w="90%" maxW="360px" alignSelf="flex-start" mb={4}>
        <Heading
          fontSize="20px"
          fontFamily="'PixelifySans-Bold', sans-serif"
          fontWeight="bold"
          textAlign="left"
          ml={3}
        >
          Weekly
        </Heading>
      </Box>

      {/* Card for checking socials */}
      <GradientBorderWrapper
        width="360px"
        height="110px"
        startColor="#793BC7"
        endColor="#C2D2FF"
        strokeWidth={1.5}
      >
        <Box
          position="relative"
          zIndex="1"
          display="flex"
          flexDirection="column"
          alignItems="left"
          justifyContent="start"
          height="100%"
          px="6"
          mt="4"
        >
          <Text
            fontSize="20px"
            fontFamily="'PixelifySans-Bold', sans-serif"
            color={colors.primaryText}
            textAlign="left"
          >
            Earn for checking socials
          </Text>
          <Text
            fontSize="14px"
            fontFamily="'PixelifySans-Bold', sans-serif"
            color={colors.secondaryText}
            mt="-1"
          >
            300 Points
          </Text>
          <Button
            mt="3"
            height="25px"
            width="70px"
            border="1px solid white"
            borderRadius="52px"
            bg="transparent"
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontWeight="normal"
            fontSize="14px"
            _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
            color={colors.primaryText}
            onClick={() =>
              openRewardPopup({
                name: "Earn for checking socials",
                reward_coins: 300,
              })
            }
          >
            Start
          </Button>
        </Box>
      </GradientBorderWrapper>

      {/* Navigation Bar */}
      <Flex
        w="90%"
        maxW="500px"
        justify="space-around"
        alignSelf="flex-start"
        mb={4}
        mt="4"
      >
        {["New", "Socials", "Frens", "Farming"].map((item) => (
          <Text
            fontFamily="'PixelifySans-Bold', sans-serif"
            fontSize="20px"
            fontWeight="bold"
            ml="3"
            p="1.5"
            color={
              selectedCategory === item ? colors.accent : colors.primaryText
            }
            key={item}
            cursor="pointer"
            onClick={() => filterTasks(item)}
          >
            {item}
          </Text>
        ))}
      </Flex>

      {/* Task List */}
      <Grid templateColumns="1fr" gap={4} w="100%" maxW="360px">
        {filteredTasks.map((task, index) => (
          <GradientBorderWrapper
            startColor="#793BC7"
            endColor="#C2D2FF"
            strokeWidth={1.5}
            key={index}
          >
            <Flex
              bg="transparent"
              borderRadius="12px"
              p={4}
              h="50px"
              align="center"
              justify="space-between"
            >
              <Flex align="center">
                <Image
                  src="/icons/star_icon.svg"
                  alt="Task Icon"
                  boxSize="23px"
                  mr={3}
                />
                <Stack spacing={0}>
                  <Text
                    fontFamily="'PixelifySans-Bold', sans-serif"
                    fontSize="16px"
                  >
                    {task.name}
                  </Text>
                  <Text fontSize="12px" color={colors.secondaryText}>
                    {task.reward_coins} Points
                  </Text>
                </Stack>
              </Flex>
              <Button
                height="25px"
                width="70px"
                border="1px solid white"
                borderRadius="52px"
                bg="transparent"
                fontFamily="'PixelifySans-Bold', sans-serif"
                fontWeight="normal"
                fontSize="14px"
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                color={colors.primaryText}
                onClick={() => openRewardPopup(task)}
              >
                Start
              </Button>
            </Flex>
          </GradientBorderWrapper>
        ))}
      </Grid>

     {/* Task Popup */}
      {selectedTask && (
        <TaskPopup
          icon="/icons/star_icon.svg"
          reward={selectedTask.reward_coins}
          name={selectedTask.name}
          description={selectedTask.description}
          button1Text="Subscribe"
          button1Link={selectedTask.link}
          button2Text="Check"
          category={selectedCategory}
          onSubscribe={handleSubscribe}
          isLoading={isLoading}
          isChecked={isChecked}
          onCheck={handleCheck}
          isOpen={isRewardPopupOpen}
          onClose={closeRewardPopup}
        />
      )}
    </Flex>
  );
};

export default Earn;
