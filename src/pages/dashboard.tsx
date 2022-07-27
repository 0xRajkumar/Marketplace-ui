import type { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { useAccount, useContract, useSigner } from "wagmi";
import artDAbi from "../abis/artDAbi.json";
import artDMAbi from "../abis/artDMAbi.json";
import { artDAddress, artDMAddress } from "../constants/contracts";
import { useContractRead } from "wagmi";
import { ethers } from "ethers";
import axios from "axios";
type nftObjType = {
  name: string;
  description: string;
  image: string;
};
type id = { id: number };
type nftType = nftObjType & id;
const DashBoard: NextPage = () => {
  const [mounted, setmounted] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [ListingFor, setListingFor] = useState<number>(0);
  const [activeItemForListing, setactiveItemForListing] = useState(
    {} as nftType
  );
  const {
    isOpen: isListingModalOpen,
    onOpen: onListingModalOpen,
    onClose: onListingModalClose,
  } = useDisclosure();

  const [ownedNFTs, setOwnedNFTs] = useState<string[] | null>(null);
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
  function ownerTokenIds() {
    ArtDcontract.ownerTokenIds(address)
      .then((result: any) => {
        Promise.all(
          result.map(async (id: any) => {
            try {
              const URI = await ArtDcontract.tokenURI(id);
              const nftObj = await axios.get(URI);
              return { id: Number(id), ...nftObj.data };
            } catch (err) {
              console.log(err);
            }
          })
        )
          .then((result: any) => {
            setOwnedNFTs(result);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
  useEffect(() => {
    setmounted(true);
    if (!isConnected) return;
    ownerTokenIds();
    isApprovedForAll();
  }, [isConnected, address, ArtDcontract, isApprovedForAll]);
  async function handleListing() {
    try {
      const listingPrice = await ArtDMcontract.getListingPrice();
      const tx = await ArtDMcontract.createMarketItem(
        activeItemForListing.id,
        ethers.utils.parseEther(ListingFor.toString()),
        { value: listingPrice }
      );
      await tx.wait();
      onListingModalClose();
      ownerTokenIds();
    } catch (error) {
      console.log(
        "🚀 ~ file: dashboard.tsx ~ line 114 ~ handleListing ~ error",
        error
      );
    }
  }
  function handleListingPriceInput(
    valueAsString: string,
    valueAsNumber: number
  ) {
    setListingFor(valueAsNumber);
  }
  async function isApprovedForAll() {
    try {
      const isApproved = await ArtDcontract.isApprovedForAll(
        address,
        artDMAddress
      );
      setIsApproved(isApproved);
    } catch (error) {
      console.log(error);
    }
  }
  async function handleApprove() {
    try {
      await ArtDcontract.setApprovalForAll(artDMAddress, true);
      setIsApproved(true);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <Container maxW="8xl" minH="calc(100vh - 76px)">
      <Box pt="14" borderBottom="2">
        <Heading>Your NFT&apos;s</Heading>
      </Box>
      <Flex flexDirection="row" flexWrap="wrap" gap="4">
        {ownedNFTs ? (
          ownedNFTs.map((NftObj: any, key: number) => {
            const { id, name, description, image } = NftObj;
            return (
              <Box key={key} py={6}>
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
                      onClick={() => {
                        onListingModalOpen();
                        setactiveItemForListing(NftObj);
                      }}
                    >
                      List On Marketplace
                    </Button>
                  </Stack>
                </Box>
              </Box>
            );
          })
        ) : (
          <Box>
            <Heading
              fontWeight="extrabold"
              fontSize={{ base: "3xl", sm: "6xl", md: "6xl", lg: "7xl" }}
            >
              {mounted && isConnected ? (
                <Text>You don&apos;t Own Any NFT</Text>
              ) : (
                "Please Connect To Metamask"
              )}
            </Heading>
          </Box>
        )}
      </Flex>
      <Modal
        blockScrollOnMount={false}
        isOpen={isListingModalOpen}
        onClose={() => {
          onListingModalClose();
          setactiveItemForListing({} as nftType);
          setListingFor(0);
        }}
      >
        <ModalOverlay />
        <ModalContent borderRadius="2xl" bgColor="purple.100">
          <ModalHeader>
            {activeItemForListing.name} #{activeItemForListing.id}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontWeight="bold" mb="1rem">
              {activeItemForListing.description}
            </Text>
            <Image mb="4" src={activeItemForListing.image} mx="auto" alt="" />
            <FormControl>
              <FormLabel>Amount(In Ether)</FormLabel>
              <NumberInput
                min={0}
                isRequired
                name="listingPrice"
                bgColor="purple.200"
                borderRadius="xl"
                onChange={handleListingPriceInput}
                value={Number(ListingFor)}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            {isApproved ? (
              <Button
                w="full"
                borderRadius="2xl"
                colorScheme="facebook"
                onClick={handleListing}
              >
                List Item
              </Button>
            ) : (
              <Button
                w="full"
                borderRadius="2xl"
                colorScheme="facebook"
                onClick={handleApprove}
              >
                Approve Market
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default DashBoard;
