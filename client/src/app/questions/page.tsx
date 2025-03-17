'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Input,
  Select,
  useToast,
  IconButton,
  Flex,
  Tag,
  TagCloseButton,
  TagLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import apiClient from '../../lib/axios';
import QuestionCard from '../../components/questions/QuestionCard';
import { useAuth } from '../../hooks/useAuth';
import { ChevronDownIcon, SearchIcon } from '@chakra-ui/icons';

interface Question {
  _id: string;
  title: string;
  content: string;
  isBookmarked: boolean;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [timeRange, setTimeRange] = useState('all');
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      setSelectedTags([tag]);
    }
    fetchQuestions();
  }, [sortBy, timeRange, searchParams]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams({
        sort: sortBy,
        time: timeRange,
        search: searchQuery,
        tags: selectedTags.join(','),
      });

      const response = await apiClient.get(
        `/questions?${params.toString()}`
      );
      setQuestions(response.data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '質問の取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchQuestions();
  };

  const handleTagRemove = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    fetchQuestions();
  };

  const handleBookmarkToggle = async (questionId: string, isBookmarked: boolean) => {
    try {
      if (isBookmarked) {
        await apiClient.delete(`/bookmarks/${questionId}`);
      } else {
        await apiClient.post('/bookmarks', {
          questionId,
        });
      }
      
      // 質問リストの更新
      setQuestions(questions.map((q: any) => 
        q._id === questionId ? { ...q, isBookmarked: !isBookmarked } : q
      ));

      toast({
        title: isBookmarked ? 'ブックマークを解除しました' : 'ブックマークに追加しました',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'ブックマークの操作に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <HStack justify="space-between" mb={8}>
        <Heading size="lg">質問一覧</Heading>
        <Button
          colorScheme="blue"
          onClick={() => router.push('/questions/new')}
        >
          質問を投稿
        </Button>
      </HStack>

      <Box mb={8}>
        <HStack spacing={4} mb={4}>
          <Box flex="1">
            <Input
              placeholder="キーワードで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Box>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              並び替え: {sortBy === 'newest' ? '新着順' : sortBy === 'popular' ? '人気順' : '回答数順'}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setSortBy('newest')}>新着順</MenuItem>
              <MenuItem onClick={() => setSortBy('popular')}>人気順</MenuItem>
              <MenuItem onClick={() => setSortBy('answers')}>回答数順</MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              期間: {
                timeRange === 'all' ? '全期間' :
                timeRange === 'today' ? '24時間' :
                timeRange === 'week' ? '1週間' : '1ヶ月'
              }
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => setTimeRange('all')}>全期間</MenuItem>
              <MenuItem onClick={() => setTimeRange('today')}>24時間</MenuItem>
              <MenuItem onClick={() => setTimeRange('week')}>1週間</MenuItem>
              <MenuItem onClick={() => setTimeRange('month')}>1ヶ月</MenuItem>
            </MenuList>
          </Menu>
          <IconButton
            aria-label="検索"
            icon={<SearchIcon />}
            onClick={handleSearch}
          />
        </HStack>

        {selectedTags.length > 0 && (
          <Flex gap={2} mb={4}>
            {selectedTags.map(tag => (
              <Tag key={tag} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => handleTagRemove(tag)} />
              </Tag>
            ))}
          </Flex>
        )}
      </Box>

      <VStack spacing={4} align="stretch">
        {questions.map((question: any) => (
          <QuestionCard
            key={question._id}
            question={question}
            onBookmarkToggle={handleBookmarkToggle}
          />
        ))}
      </VStack>
    </Container>
  );
} 