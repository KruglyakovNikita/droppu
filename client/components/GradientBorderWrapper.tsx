import { Box } from '@chakra-ui/react';
import { useId } from 'react';

const GradientBorderWrapper = ({
  children,
  borderRadius = 12, // в пикселях
  startColor = '#ff7e5f',
  endColor = '#feb47b',
  strokeWidth = 2, // в пикселях
  ...props
}) => {
  const gradientId = useId();

  // Преобразуем borderRadius и strokeWidth в строки с единицами измерения
  const borderRadiusPx = `${borderRadius}px`;
  const strokeWidthPx = `${strokeWidth}px`;

  return (
    <Box
      position="relative"
      borderRadius={borderRadiusPx}
      overflow="visible" // Изменено на 'visible' чтобы обводка не обрезалась
      {...props}
    >
      <Box
        as="svg"
        position="absolute"
        top={`-${strokeWidth}px`}
        left={`-${strokeWidth}px`}
        width={`calc(100% + ${strokeWidth * 2}px)`}
        height={`calc(100% + ${strokeWidth * 2}px)`}
        pointerEvents="none"
        xmlns="http://www.w3.org/2000/svg"
        sx={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
        <rect
          x={strokeWidth}
          y={strokeWidth}
          width={`calc(100% - ${strokeWidth * 2}px)`}
          height={`calc(100% - ${strokeWidth * 2}px)`}
          rx={borderRadius}
          ry={borderRadius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
        />
      </Box>
      <Box position="relative" borderRadius={borderRadiusPx} h="100%">
        {children}
      </Box>
    </Box>
  );
};

export default GradientBorderWrapper;
