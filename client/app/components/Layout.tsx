import { Box, Flex, Stack, VStack } from "@chakra-ui/react";
import NavBar from "./NavBar";
import WelcomeModal from "./WelcomeModal";
import { initUser } from "../lib/api/user";
import { useEffect, useState } from "react";
import { useStore } from "../lib/store/store";
import CheckInModal from "./CheckInModal";
import { CheckInInfo, FirstLoginInfo } from "../lib/store/types";
import { Spinner } from "@chakra-ui/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const setTelegramUser = useStore((state) => state.setTelegramUser);
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const [checkInInfo, setCheckInInfo] = useState<CheckInInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [firstLoginInfo, setFirstLoginInfo] = useState<FirstLoginInfo>();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        if (tg.initDataUnsafe) {
          setTelegramUser(tg.initDataUnsafe.user);

          const startParam = tg.initDataUnsafe.start_param || "";
          authenticate({
            ...JSON.parse(JSON.stringify(tg.initDataUnsafe).replace(/'/g, '"')),
            start_param: startParam ?? "",
          });
          tg.ready();
          tg.expand();
          tg.setHeaderColor("#0D1478");
          tg.HapticFeedback.notificationOccurred("warning");
          window.Telegram.WebApp.disableVerticalSwipes();
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const authenticate = async (initData: string) => {
    try {
      setIsLoading(true);
      console.log("initData");

      const response = await initUser({
        query_id: "AAF03wc0AgAAAHTfBzROOCVW",
        user: {
          id: 7898484566,
          first_name: "Иван",
          last_name: "Иванов",
          username: "ivanivanov",
          language_code: "ru",
          is_premium: true,
          allows_write_to_pm: true,
        },
        auth_date: 1722938610,
        hash: "8654c8c617c143abf656f4f159be2539880a56f58c2d9be622f90c0346aa162b",
      });
      const data = response.data;

      if (data?.user) {
        setUser(data.user);
      }
      if (data?.check_in_info) {
        setCheckInInfo(data.check_in_info);
      }
      if (data?.first_login_info) {
        setFirstLoginInfo(data.first_login_info);
      }
    } catch (error) {
      console.error("Request Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack minHeight="100vh" align="stretch">
      {isLoading ? (
        <Flex
          alignItems="center"
          justifyContent="center"
          minHeight="100vh"
          bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
        >
          <Spinner thickness="4px" speed="1s" emptyColor="gray.100" size="xl" />
        </Flex>
      ) : (
        <>
          {(!user?.is_first_login || !user.is_first_login) &&
          user?.check_in &&
          checkInInfo ? (
            <CheckInModal data={checkInInfo} />
          ) : null}

          {user?.is_first_login && firstLoginInfo ? (
            <WelcomeModal data={firstLoginInfo} />
          ) : null}

          <Box flex={1} as="main">
            {children}
          </Box>
          <NavBar />
        </>
      )}
    </VStack>
  );
};

export default Layout;
