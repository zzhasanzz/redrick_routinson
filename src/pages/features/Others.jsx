import React from "react";
import {
  Box,
  Flex,
  Heading,
  Link,
  Input,
  Button,
  Image,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";

const Others = () => {
  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* Logo Placeholder */}
      <Flex justify="center" mb={8}>
        <Image
          src="../../assets/redrick_logo.png" // Replace with your logo URL
          alt="Project Logo"
          boxSize="400px"
          borderRadius="md"
        />
      </Flex>

      {/* GitHub Repo Link */}
      <Flex justify="center" mb={8}>
        <Link
          href="https://github.com/shufanshahi/Redrick_Routinson.git" // Replace with your GitHub repo link
          isExternal
          color="teal.500"
          fontSize="lg"
          fontWeight="bold"
          _hover={{ textDecoration: "underline" }}
        >
          View on GitHub
        </Link>
      </Flex>

      {/* Contributors Section */}
      <Box textAlign="center" mb={12}>
        <Heading as="h2" size="xl" mb={6} color="teal.500">
          Contributors
        </Heading>

        <SimpleGrid columns={[1, 2, 3, 4,5,6]} spacing={6}>
          {/* Placeholder Contributor Cards */}
          {[1, 2, 3, 4,5,6].map((_, index) => (
            <Box
              key={index}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="md"
              textAlign="center"
              transition="all 0.2s"
              _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
            >
              <Image
                src="https://via.placeholder.com/80" // Replace with contributor avatar
                alt="Contributor"
                boxSize="80px"
                borderRadius="full"
                mx="auto"
                mb={4}
              />
              <Text fontSize="lg" fontWeight="bold" color="teal.500">
                IUT     
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default Others;