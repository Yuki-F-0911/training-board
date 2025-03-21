'use client';

import {
  Box,
  Heading,
  Text,
  HStack,
  Tag,
  Flex,
  Avatar,
  IconButton,
} from '@chakra-ui/react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useAuth } from '../../hooks/useAuth';
import { StarIcon } from '@chakra-ui/icons';

interface QuestionCardProps {
  question: {
    _id: string;
    title: string;
    content: string;
    tags: string[];
    author: {
      username: string;
      email: string;
    };
    createdAt: string;
    answersCount: number;
    isBookmarked: boolean;
  };
  onBookmarkToggle: (questionId: string, isBookmarked: boolean) => void;
}

const QuestionCard = ({ question, onBookmarkToggle }: QuestionCardProps) => {
  const { user } = useAuth();

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      onBookmarkToggle(question._id, question.isBookmarked);
    }
  };

  return (
    <Link href={`/questions/${question._id}`}>
      <Box
        p={5}
        borderWidth="1px"
        borderRadius="lg"
        _hover={{ shadow: 'md', borderColor: 'blue.500' }}
        transition="all 0.2s"
        cursor="pointer"
        position="relative"
      >
        {user && (
          <IconButton
            aria-label="ブックマーク"
            icon={<StarIcon />}
            position="absolute"
            top={4}
            right={4}
            variant="ghost"
            color={question.isBookmarked ? 'blue.500' : 'gray.400'}
            onClick={handleBookmarkClick}
          />
        )}

        <Flex justifyContent="space-between" alignItems="flex-start">
          <Box flex="1" pr={12}>
            <Heading size="md" mb={2}>
              {question.title}
            </Heading>
            <Text noOfLines={2} mb={4} color="gray.600">
              {question.content}
            </Text>
            <HStack spacing={2} mb={4}>
              {question.tags.map((tag) => (
                <Tag key={tag} size="sm" colorScheme="blue">
                  {tag}
                </Tag>
              ))}
            </HStack>
          </Box>
          <Text color="gray.500" fontSize="sm" whiteSpace="nowrap">
            回答 {question.answersCount}件
          </Text>
        </Flex>
        <Flex justifyContent="space-between" alignItems="center">
          <HStack spacing={2}>
            <Avatar size="sm" name={question.author?.username || 'ユーザー'} />
            <Text fontSize="sm">{question.author?.username || 'ユーザー'}</Text>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {formatDistanceToNow(new Date(question.createdAt), {
              addSuffix: true,
              locale: ja,
            })}
          </Text>
        </Flex>
      </Box>
    </Link>
  );
};

export default QuestionCard; 