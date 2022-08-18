import {
  Avatar,
  Box,
  Center,
  Container,
  Heading,
  Image,
  Stack,
  Text,
  useColorModeValue,
  Divider,
  Button,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import artDAbi from "../abis/artDAbi.json";
import artDMAbi from "../abis/artDMAbi.json";
import { artDAddress, artDMAddress } from "../constants/contracts";
import { useAccount, useContract, useSigner } from "wagmi";
import axios from "axios";
import { ethers } from "ethers";
const Invest: NextPage = () => {
  const [mounted, setmounted] = useState<boolean>(false);
  const [Items, setItems] = useState<any[] | null>(null);
  const {
    address,
    isConnected,
    connector,
    isConnecting,
    isDisconnected,
    isReconnecting,
    status,
  } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const ArtDcontract = useContract({
    addressOrName: artDAddress,
    contractInterface: artDAbi,
    signerOrProvider: signer,
  });
  const ArtDMcontract = useContract({
    addressOrName: artDMAddress,
    contractInterface: artDMAbi,
    signerOrProvider: signer,
  });

  async function fetchAllMarketItems() {
    ArtDMcontract.fetchMarketItems()
      .then((result: any) => {
        Promise.all(
          result.map(async (resultItem: any) => {
            try {
              const tokenUri = await ArtDcontract.tokenURI(resultItem.tokenId);
              const nftObj = await axios.get(tokenUri);

              return {
                id: Number(resultItem.tokenId),
                ...nftObj.data,
                price: ethers.utils.formatEther(resultItem.price.toString()),
              };
            } catch (err) {
              console.log(err);
            }
          })
        ).then((items) => {
          if (items[0] != undefined) {
            setItems(items);
          }
        });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  useEffect(() => {
    setmounted(true);
    if (!isConnected) return;
    fetchAllMarketItems();
  }, [isConnected, address, ArtDMcontract]);

  async function handleBuy(id: any, price: any) {
    if (isConnected) {
      try {
        const tx = await ArtDMcontract.createMarketSale(id, {
          value: ethers.utils.parseEther(price),
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("PLEASE CONNECT TO WALLET");
    }
  }

  return (
    <Container maxW={"8xl"} minH="calc(100vh - 76px)">
      <Box pt="14" borderBottom="2">
        <Heading>Buy NFT&apos;s Now</Heading>
        <Text as="p" fontSize={{ base: "lg", md: "xl" }} color="gray.600">
          Browse current investment opportunities on Republic.
        </Text>
      </Box>
      <Divider />
      <Box display={"flex"} flexWrap={"wrap"} gap="4">
        {mounted && Items ? (
          Items.map((data, index) => {
            console.log(data);
            const { id, name, description, image, price } = data;
            return (
              <Box key={index} py={6}>
                <Box
                  minW={"300px"}
                  w={"360px"}
                  bg={"white"}
                  boxShadow={"2xl"}
                  rounded={"md"}
                  overflow={"hidden"}
                  bgColor="blackAlpha.200"
                >
                  <Image
                    src={image}
                    h="250px"
                    w="full"
                    objectFit="cover"
                    alt="Yo"
                  />
                  <Box p="6">
                    <Text
                      color={"green.500"}
                      textTransform={"uppercase"}
                      fontWeight={800}
                      fontSize={"sm"}
                      letterSpacing={1.1}
                    >
                      #{id}
                    </Text>
                    <Heading
                      color={"gray.700"}
                      fontSize={"2xl"}
                      fontFamily={"body"}
                      mb="2"
                      fontWeight="semibold"
                    >
                      {name}
                    </Heading>
                    <Text color={"gray.700"}>{description}</Text>
                  </Box>
                  <Stack pb="4" direction={"row"} px="6" alignItems={"center"}>
                    <Button
                      borderRadius="2xl"
                      colorScheme="facebook"
                      w="full"
                      px="4"
                      onClick={() => {
                        handleBuy(id, price);
                      }}
                    >
                      price {price}
                    </Button>
                  </Stack>
                </Box>
              </Box>
            );
          })
        ) : (
          <Box
            fontWeight="extrabold"
            fontSize={{ base: "3xl", sm: "6xl", md: "6xl", lg: "7xl" }}
          >
            {mounted && isConnected ? (
              <Text>NO NFT Is Listed Now</Text>
            ) : (
              "Please Connect To Metamask"
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Invest;
