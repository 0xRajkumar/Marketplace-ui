import Link from "next/link";
import {
  Button,
  HStack,
  Heading,
  Text,
  Box,
  Wrap,
  WrapItem,
  Center,
  Link as CLink,
  Container,
} from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

import { ChevronDownIcon } from "@chakra-ui/icons";

import { useDisclosure } from "@chakra-ui/react";
import React, { useState, useEffect, useRef } from "react";
import { useAccount, useConnect, useNetwork, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

import Hamburger from "hamburger-react";

const Navbar: React.FunctionComponent = () => {
  const {
    isOpen: isWalletOptionsOpen,
    onOpen: onWalletOptionsOpen,
    onClose: onWalletOptionsClose,
  } = useDisclosure();
  const {
    isOpen: isSidebarOpen,
    onOpen: onSidebarOpen,
    onClose: onSidebarClose,
    onToggle: onSidebarToggle,
  } = useDisclosure();
  const { chain, chains } = useNetwork();
  const { disconnect } = useDisconnect();

  const { address, isConnected, connector } = useAccount();
  const [isSSR, setIsSSR] = useState<boolean>(true);

  const { connect, isSuccess } = useConnect({
    connector: new InjectedConnector(),
  });

  const connectWalletBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsSSR(false);
  }, []);
  return (
    <Box>
      <HStack
        mx="auto"
        paddingX="4"
        paddingY="4"
        display="flex"
        justifyContent="space-between"
      >
        <Box display={{ md: "none" }}>
          <Hamburger
            toggled={isSidebarOpen}
            toggle={() => {
              onSidebarToggle();
            }}
          />
        </Box>
        <Heading color={""} display={{ base: "none", md: "block" }}>
          ART Dodger
        </Heading>
        <HStack>
          <HStack pr={"10"} display={{ base: "none", md: "block" }}>
            <Wrap fontSize={"xl"} spacingX={"6"}>
              <WrapItem>
                <Link href="/">
                  <CLink href="">Home</CLink>
                </Link>
              </WrapItem>
              <WrapItem>
                <Link href="/dashboard">
                  <CLink href="">Dashbaord</CLink>
                </Link>
              </WrapItem>
              <WrapItem>
                <Link href="/marketplace">
                  <CLink href="">Marketplace</CLink>
                </Link>
              </WrapItem>
              <WrapItem>
                <Link href="/createnft">
                  <CLink href="">Create NFT</CLink>
                </Link>
              </WrapItem>
            </Wrap>
          </HStack>
          {!isSSR && isConnected ? (
            <Menu>
              <MenuButton
                px="4"
                colorScheme="facebook"
                borderRadius="3xl"
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                {address?.toString().slice(0, -36)}...
                {address?.toString().substring(38)}
              </MenuButton>
              <MenuList bgColor="purple.100" shadow="xl">
                <MenuDivider />
                <Text pl="3">
                  <Text>Network</Text>
                  <Box
                    display="flex"
                    flexDirection="row"
                    columnGap="1"
                    alignItems="center"
                    justifyContent="left"
                  >
                    <Box h="2" w="2" borderRadius="full" bgColor="green"></Box>{" "}
                    <Text>{chain?.name}</Text>
                  </Box>
                </Text>
                <MenuDivider />
                <MenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(address ?? "");
                  }}
                >
                  Copy address
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    disconnect();
                  }}
                >
                  Disconnect
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button
              px="4"
              colorScheme="facebook"
              borderRadius="3xl"
              ref={connectWalletBtnRef}
              onClick={onWalletOptionsOpen}
            >
              ConnectWallet{" "}
            </Button>
          )}
        </HStack>
      </HStack>
      <Modal
        onClose={onWalletOptionsClose}
        finalFocusRef={connectWalletBtnRef}
        isOpen={isWalletOptionsOpen && !isSuccess}
        scrollBehavior={"inside"}
      >
        <ModalOverlay />
        <ModalContent borderRadius="2xl" bgColor="purple.100">
          <ModalHeader>Connect Wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Button
              size={"lg"}
              onClick={() => {
                connect();
              }}
              borderRadius="2xl"
              colorScheme="purple"
              width={"100%"}
            >
              Browser Wallet
            </Button>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
      <Drawer
        placement={"left"}
        onClose={onSidebarClose}
        isOpen={isSidebarOpen}
      >
        <DrawerOverlay />
        <DrawerContent bgColor="purple.100">
          <DrawerHeader borderBottomWidth="1px">LOGO</DrawerHeader>
          <DrawerBody p="0" fontWeight={"semibold"}>
            <Text pl="6" py="3" onClick={onSidebarClose}>
              <Link href="/">
                <CLink>Home</CLink>
              </Link>
            </Text>
            <Text px="6" py="3" onClick={onSidebarClose}>
              <Link href="/dashboard">
                <CLink>DashBoard</CLink>
              </Link>
            </Text>
            <Text px="6" py="3" onClick={onSidebarClose}>
              <Link href="/marketplace">
                <CLink>Marketplace</CLink>
              </Link>
            </Text>
            <Text px="6" py="3" onClick={onSidebarClose}>
              <Link href="/createnft">
                <CLink>capital NFT</CLink>
              </Link>
            </Text>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
