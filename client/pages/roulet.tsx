import React, { useState } from "react";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import * as d3Shape from "d3-shape";
import { randomColor } from "randomcolor";
import { motion, useAnimation } from "framer-motion";

const wheelSize = 320;
const fontSize = 16;
const oneTurn = 360;
const numberOfSegments = 12;
const angleBySegment = oneTurn / numberOfSegments;
const angleOffset = angleBySegment / 2;

// Генерация колеса
const makeWheel = () => {
  const data = Array.from({ length: numberOfSegments }).fill(1);
  const arcs = d3Shape.pie()(data);
  const colors = Array.from({ length: numberOfSegments }).map(() =>
    randomColor({ luminosity: "dark" })
  );

  return arcs.map((arc, index) => {
    const instance = d3Shape
      .arc()
      .padAngle(0.01)
      .outerRadius(wheelSize / 2)
      .innerRadius(50);

    return {
      path: instance(arc),
      color: colors[index],
      value: ["$1", "$5", "ZERO", "$100", "JACKPOT", "$20", "$50", "$10", "$1", "$10", "ZERO", "$2"][index],
      centroid: instance.centroid(arc),
    };
  });
};

export default function FortuneWheel() {
  const [wheelPaths, setWheelPaths] = useState(makeWheel);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState(null);
  const controls = useAnimation();

  const startSpin = () => {
    if (!spinning) {
      setSpinning(true);
      setResult(null); // Скрыть предыдущий результат перед новым запуском

      // Вибрация при старте
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Вращаем на несколько полных оборотов и добавляем случайный угол
      const newAngle = angle + 360 * 5 + Math.floor(Math.random() * 360);
      setAngle(newAngle);

      controls
        .start({
          rotate: newAngle,
          transition: { duration: 5, ease: "easeOut" },
        })
        .then(() => {
          setSpinning(false);

          // Вибрация при остановке
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }

          // Корректируем угол, чтобы получить правильный индекс выигрыша
          const finalAngle = (newAngle % 360 + 360) % 360; // Приводим к диапазону 0-360
          const winnerIndex = Math.floor((oneTurn - finalAngle + angleOffset - 15) / angleBySegment) % numberOfSegments; // Сдвиг -15 для точной указки
          const winner = wheelPaths[winnerIndex].value;
          setResult(winner);
        });
    }
  };

  const buySpin = () => {
    if (window.confirm("Купить прокрут за 1 звезду?")) {
      startSpin();
    }
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
      color="white"
      p={4}
    >
      <Button
        onClick={() => window.history.back()}
        position="absolute"
        top="20px"
        left="20px"
        variant="ghost"
        color="gray.400"
      >
        Back
      </Button>

      <Heading fontSize="24px" fontFamily="'PixelifySans-Bold', sans-serif" mb={6}>
        Spin The Fortune Wheel
      </Heading>

      {/* Уведомление о выигрыше */}
      {result && (
        <Box
          position="absolute"
          top="80px"
          bg="purple.500"
          color="white"
          p={3}
          borderRadius="md"
          boxShadow="lg"
          fontSize="lg"
          fontWeight="bold"
          animation="fadeIn 1s"
          zIndex="2"
        >
          🎉 Congratulations! You won: {result} 🎉
        </Box>
      )}

      {/* Колесо рулетки */}
      
      <Box
        as={motion.div}
        style={{ width: wheelSize, height: wheelSize }}
        animate={controls}
        initial={false}
        borderRadius="full"
        overflow="hidden"
        boxShadow="0px 4px 10px rgba(0, 0, 0, 0.25)"
        bg="linear-gradient(to-r, #282a36, #44475a)"
      >
        <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
          <g transform={`translate(${wheelSize / 2}, ${wheelSize / 2})`}>
            {wheelPaths.map((arc, index) => (
              <g key={index}>
                <path d={arc.path} fill={arc.color} />
                <text
                  x={arc.centroid[0]}
                  y={arc.centroid[1]}
                  fontSize={fontSize}
                  fill="white"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  {arc.value}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </Box>

      {/* Стрелка */}
      <Box
        position="absolute"
        top="calc(50% - 190px)"
        left="50%"
        transform="translateX(-50%) rotate(180deg)"
        w="0"
        h="0"
        borderLeft="15px solid transparent"
        borderRight="15px solid transparent"
        borderBottom="30px solid gold" // Изменено на `borderTop` для перевернутой стрелки
        zIndex="1"
        borderRadius="2px"
        boxShadow="0px 4px 6px rgba(0, 0, 0, 0.3)"
      />

      {/* Кнопки Play и Buy */}
      <Flex mt={8} gap={4}>
        <Button
          onClick={startSpin}
          isDisabled={spinning}
          colorScheme="purple"
          w="100px"
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.2)"
          borderRadius="20px"
        >
          Play
        </Button>
        <Button
          onClick={buySpin}
          colorScheme="teal"
          w="100px"
          isDisabled={spinning}
          boxShadow="0px 4px 8px rgba(0, 0, 0, 0.2)"
          borderRadius="20px"
        >
          Buy
        </Button>
      </Flex>
    </Flex>
  );
}
