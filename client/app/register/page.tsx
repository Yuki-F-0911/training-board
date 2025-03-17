'use client';

import { Box, Heading, Text, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import RegisterForm from '../components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <Box p={8}>
      <Heading textAlign="center" mb={4}>
        新規登録
      </Heading>
      <RegisterForm />
      <Text mt={4} textAlign="center">
        すでにアカウントをお持ちの方は{' '}
        <Link href="/login" passHref>
          <ChakraLink color="blue.500">こちら</ChakraLink>
        </Link>
      </Text>
    </Box>
  );
} 