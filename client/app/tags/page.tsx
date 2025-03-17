'use client';

import { Container, Heading } from '@chakra-ui/react';
import TagList from '../../components/tags/TagList';

export default function TagsPage() {
  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="lg" mb={8}>
        タグ一覧
      </Heading>
      <TagList />
    </Container>
  );
} 