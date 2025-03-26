'use client';

import { Container, Heading } from '@chakra-ui/react';
import QuestionForm from '../../components/questions/QuestionForm';

export default function NewQuestionPage() {
  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="lg" mb={8} textAlign="center">
        質問を投稿
      </Heading>
      <QuestionForm />
    </Container>
  );
} 