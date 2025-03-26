'use client'

import { Box, Heading, Text, Button, Container } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <Container maxW="container.lg" py={8}>
      <Box textAlign="center" py={10}>
        <Heading as="h1" size="2xl" mb={6}>
          マラソントレーニングQ&A
        </Heading>
        <Text fontSize="xl" mb={8}>
          マラソンのトレーニングに関する質問と回答のプラットフォーム
        </Text>
        <Button 
          colorScheme="blue" 
          size="lg" 
          onClick={() => router.push('/questions')}
        >
          質問を見る
        </Button>
      </Box>
    </Container>
  )
} 