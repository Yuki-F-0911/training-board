'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Heading,
  VStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import apiClient from '../lib/axios';
import QuestionCard from '../components/questions/QuestionCard';
import { useAuth } from '../hooks/useAuth';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const response = await apiClient.get('/bookmarks');
      setBookmarks(response.data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ブックマークの取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async (questionId: string, isBookmarked: boolean) => {
    try {
      await apiClient.delete(`/bookmarks/${questionId}`);
      setBookmarks(bookmarks.filter((b: any) => b.question._id !== questionId));
      
      toast({
        title: 'ブックマークを解除しました',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ブックマークの解除に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>ブックマーク機能を利用するにはログインが必要です。</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Heading size="lg" mb={8}>
        ブックマーク一覧
      </Heading>

      <VStack spacing={4} align="stretch">
        {bookmarks.map((bookmark: any) => (
          <QuestionCard
            key={bookmark.question._id}
            question={{ ...bookmark.question, isBookmarked: true }}
            onBookmarkToggle={handleBookmarkToggle}
          />
        ))}
        {bookmarks.length === 0 && (
          <Text color="gray.500" textAlign="center">
            ブックマークした質問はありません
          </Text>
        )}
      </VStack>
    </Container>
  );
} 