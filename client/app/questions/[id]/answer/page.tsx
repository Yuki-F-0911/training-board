'use client';

import { Container, Heading } from '@chakra-ui/react';
import AnswerForm from '../../../../components/answers/AnswerForm';

export default function NewAnswerPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="lg" mb={8} textAlign="center">
        回答を投稿
      </Heading>
      <AnswerForm questionId={params.id} />
    </Container>
  );
} 