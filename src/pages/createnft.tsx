import {
  useState,
  useEffect,
  HTMLInputTypeAttribute,
  ChangeEvent,
} from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Hero from "../components/Hero";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
} from "@chakra-ui/react";
import { useAccount, useContract, useSigner } from "wagmi";
import { Textarea } from "@chakra-ui/react";
import { create as ipfsHttpClient, Options } from "ipfs-http-client";
import artDAbi from "../abis/artDAbi.json";
import { artDAddress } from "../constants/contracts";
import { Web3Storage } from "web3.storage";

const key: any =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDNkNWIxODg4MGZCRDNlODFmMThjMTgwMTUxRUJhMzU0RERCNzk2MDQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM3NzYwNTYzNTAsIm5hbWUiOiJSRUkifQ.MCkF8eYXgLAgMLVbLwOeabvEUrltjkXD5Vw81RCfsGY";
const web3storage = new Web3Storage({ token: key });

const CreateNft: NextPage = () => {
  const [mounted, setmounted] = useState<boolean>(false);
  const {
    address,
    isConnected,
    connector,
    isConnecting,
    isDisconnected,
    isReconnecting,
    status,
  } = useAccount();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [formInput, updateFormInput] = useState<{
    name: string;
    description: string;
    royalty: number;
  }>({
    name: "",
    description: "",
    royalty: 0,
  });
  const { data: signer, isError, isLoading } = useSigner();

  const ArtDcontract = useContract({
    addressOrName: artDAddress,
    contractInterface: artDAbi,
    signerOrProvider: signer,
  });

  async function handleImage(e: any) {
    try {
      const target = e.target;
      const file = target.files[0];
      const name = "default";
      const newfile = new File([file], name, {
        type: file.type,
        lastModified: file.lastModified,
      });
      const metadata = new File(
        [JSON.stringify({ name: name })],
        "metadata.json"
      );
      const path = await web3storage.put([newfile, metadata]);
      const url: string = `https://ipfs.io/ipfs/${path}/${name}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function handleFormInput(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    updateFormInput((preData) => {
      return { ...preData, [name]: value };
    });
  }

  async function createNft() {
    const { name, description, royalty } = formInput;
    if (!name || !description || !royalty || !fileUrl) return;

    try {
      const nft = {
        name,
        description,
        image: fileUrl,
      };
      const buffer = Buffer.from(JSON.stringify(nft));
      const files = [new File([buffer], `metadata.json`)];
      const cid = await web3storage.put(files);
      const url = `${cid}/metadata.json`;
      createitem(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createitem(url: string) {
    if (!isConnected) return;
    try {
      const tx = await ArtDcontract.mintNft(
        url,
        address,
        formInput.royalty * 100 + "",
        {
          from: address,
        }
      );
      await tx.wait();
      updateFormInput({
        name: "",
        description: "",
        royalty: 0,
      });
      setFileUrl(null);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setmounted(true);
  }, []);

  return (
    <Container maxW={"8xl"} minH="calc(100vh - 76px)">
      <Box pt="14" borderBottom="2" mb="4">
        <Heading>Create NFT now</Heading>
      </Box>
      <Flex>
        <Box
          borderRadius="2xl"
          display="flex"
          flexDirection="column"
          w="full"
          mb="10"
          bgColor="whiteAlpha.400"
          columnGap="2"
          p="4"
        >
          <FormControl mb="4">
            <Box>
              <FormLabel>Name</FormLabel>
              <Input
                mb="4"
                name="name"
                onChange={handleFormInput}
                type="text"
                borderColor="black"
              />
              <FormLabel>Discription</FormLabel>
              <Textarea
                borderColor="black"
                mb="4"
                height={"56"}
                onChange={handleFormInput}
                name="description"
                value={formInput.description}
              />
              <FormLabel>Royalty percentage</FormLabel>
              <NumberInput borderColor="black" max={40} mb="4" min={0}>
                <NumberInputField
                  name="royalty"
                  onChange={handleFormInput}
                  value={formInput.royalty}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box display="flex" flexDirection="row" columnGap="4">
              <Box>
                <FormLabel>Discription</FormLabel>
                <Input
                  borderColor="black"
                  maxW="60"
                  p="1"
                  type="file"
                  onChange={handleImage}
                />
              </Box>
              {fileUrl && (
                <Image
                  src={fileUrl}
                  alt="img"
                  h="auto"
                  w="48"
                  p="2"
                  shadow="2xl"
                />
              )}
            </Box>
          </FormControl>
          {mounted && isConnected ? (
            <Button
              borderRadius="2xl"
              colorScheme="facebook"
              onClick={createNft}
            >
              Create
            </Button>
          ) : (
            <Button borderRadius="2xl" colorScheme="facebook">
              Please Connect To Metamask
            </Button>
          )}
        </Box>
      </Flex>
    </Container>
  );
};

export default CreateNft;
