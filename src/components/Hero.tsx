import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect } from "react";

function Hero(): JSX.Element {
  return (
    <Container maxW="8xl" minH="calc(100vh - 76px)">
      <Box py="40">
        <Heading
          fontSize={{ base: "3xl", sm: "6xl", md: "6xl", lg: "7xl" }}
          textAlign={{ sm: "left", md: "center" }}
          mb="2"
        >
          Unique
          <Text
            display={{
              base: "block",
              lg: "inline",
            }}
            w="full"
            bgClip="text"
            bgGradient="linear(to-r, purple.400,pink.500)"
            fontWeight="extrabold"
          >
            {" "}
            Smart investments{" "}
          </Text>
          delivered to you.
        </Heading>
        <Text
          mb="4"
          textAlign={{ sm: "left", md: "center" }}
          textColor="gray.800"
        >
          Invest In Your Favourite NFT&apos;s.
        </Text>
        <Box
          display="flex"
          flexDirection="row"
          justifyContent={{ sm: "left", md: "center" }}
          alignItems="center"
          py="6"
          columnGap="4"
        >
          <Button px="6" colorScheme="facebook" borderRadius="3xl">
            <Link href="/marketplace">
              <a>Marketplace</a>
            </Link>
          </Button>
          <Button colorScheme="facebook" borderRadius="3xl" px="6">
            <Link href="/createnft">
              <a>Create NFT</a>
            </Link>
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Hero;
