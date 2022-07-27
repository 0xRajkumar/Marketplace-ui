import { Box, Button, HStack, Heading, Text, Link } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
const Layout = function ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Box bgColor={"purple.100"}>
      <Navbar />
      {children}
    </Box>
  );
};

export default Layout;
