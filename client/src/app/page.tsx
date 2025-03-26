'use client'

import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react'

export default function Home() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={4}>
            トレーニング掲示板
          </Heading>
          <Text fontSize="xl" color="gray.600">
            マラソンランナーのためのQ&Aプラットフォーム
          </Text>
        </Box>
      </VStack>
    </Container>
  )
} 