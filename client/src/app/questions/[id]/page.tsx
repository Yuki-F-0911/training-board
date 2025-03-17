'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  HStack,
  Tag,
  VStack,
  Avatar,
  Divider,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import apiClient from '../../../lib/axios';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../../../hooks/useAuth';

interface Question {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  answers: Array<{
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
}

export default function QuestionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    fetchQuestion();
  }, [params.id]);

  const fetchQuestion = async () => {
    try {
      const response = await apiClient.get(
        `/questions/${params.id}`
      );
      setQuestion(response.data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '質問の取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      router.push('/questions');
    } finally {
      setLoading(false);
    }
  };

  if (!question) {
    return null;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={4}>
          {question.title}
        </Heading>
        <HStack spacing={2} mb={4}>
          {question.tags.map((tag) => (
            <Tag key={tag} size="sm" colorScheme="blue">
              {tag}
            </Tag>
          ))}
        </HStack>
        <Text whiteSpace="pre-wrap" mb={6}>
          {question.content}
        </Text>
        <HStack spacing={2}>
          <Avatar size="sm" name={question.author.name} />
          <Text fontSize="sm">{question.author.name}</Text>
          <Text fontSize="sm" color="gray.500">
            {formatDistanceToNow(new Date(question.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </Text>
        </HStack>
      </Box>

      <Divider my={8} />

      <Box>
        <HStack justify="space-between" mb={6}>
          <Heading size="md">回答 {question.answers.length}件</Heading>
          <Button
            colorScheme="blue"
            onClick={() => router.push(`/questions/${question._id}/answer`)}
          >
            回答を投稿
          </Button>
        </HStack>

        <VStack spacing={6} align="stretch">
          {question.answers.map((answer) => (
            <Box key={answer._id} p={4} borderWidth="1px" borderRadius="lg">
              <Text whiteSpace="pre-wrap" mb={4}>
                {answer.content}
              </Text>
              <HStack spacing={2}>
                <Avatar size="sm" name={answer.author.name} />
                <Text fontSize="sm">{answer.author.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDistanceToNow(new Date(answer.createdAt), {
                    addSuffix: true,
                    locale: ja,
                  })}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </Container>
  );
} 