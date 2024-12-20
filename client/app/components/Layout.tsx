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
  const setCheckInInfo = useStore((state) => state.setCheckInInfo);
  const setFirstLoginInfo = useStore((state) => state.setFirstLoginInfo);
  const user = useStore((state) => state.user);
  const checkInInfo = useStore((state) => state.checkInInfo);
  const firstLoginInfo = useStore((state) => state.firstLoginInfo);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);

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
          tg.lockOrientation();
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

      const response = await initUser(initData);
      const data = response.data;

      if (data?.user) {
        setUser(data.user);
      }
      if (data?.check_in_info && data.user.check_in) {
        setShowModal(true);
        setCheckInInfo(data.check_in_info);
      }
      if (data?.first_login_info && data.user.is_first_login) {
        setShowModal(true);
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
      <Flex
        alignItems="center"
        justifyContent="center"
        width="100vw"
        bgGradient="linear(to-b, #0D1478, #130B3D, #130B3D, #0D1478)"
      >
        <Flex
          alignItems="center"
          justifyContent="center"
          maxW="650px"
          minW="250px"
        >
          {isLoading ? (
            <Flex
              alignItems="center"
              justifyContent="center"
              minHeight="100vh"
              width="100vw"
              bgGradient="linear(to-b, #0D1478, #130B3D, #0D1478)"
            >
              <Spinner
                thickness="4px"
                speed="1s"
                emptyColor="gray.100"
                size="xl"
              />
            </Flex>
          ) : (
            <Flex alignItems="center" justifyContent="center">
              {(!user?.is_first_login || !user.is_first_login) &&
              user?.check_in &&
              checkInInfo ? (
                <CheckInModal
                  data={checkInInfo}
                  onClose={() => {
                    setShowModal(false);
                    setCheckInInfo(null);
                  }}
                />
              ) : null}

              {user?.is_first_login && firstLoginInfo ? (
                <WelcomeModal
                  data={firstLoginInfo}
                  onClose={() => {
                    setShowModal(false);
                    setFirstLoginInfo(null);
                  }}
                />
              ) : null}

              {showModal ? null : (
                <Box flex={1} as="main">
                  {children}
                </Box>
              )}
              <NavBar />
            </Flex>
          )}
        </Flex>
      </Flex>
    </VStack>
  );
};

export default Layout;
