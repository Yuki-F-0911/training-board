'use client';

import { Box, Heading, Text, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Box p={8}>
      <Heading textAlign="center" mb={4}>
        ログイン
      </Heading>
      <LoginForm />
      <Text mt={4} textAlign="center">
        アカウントをお持ちでない方は{' '}
        <Link href="/register" passHref>
          <ChakraLink color="blue.500">こちら</ChakraLink>
        </Link>
      </Text>
    </Box>
  );
} 