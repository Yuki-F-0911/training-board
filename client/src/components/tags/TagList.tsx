import { useState, useEffect } from 'react';
import { VStack, Tag, Text, Box, useToast } from '@chakra-ui/react';
import axios from 'axios';
import apiClient from '../../lib/axios';

export default function TagList() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await apiClient.get('/tags');
      setTags(response.data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'タグの取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {tags.map((tag: any) => (
        <Box key={tag._id} p={4} borderWidth="1px" borderRadius="lg">
          <Tag size="md" colorScheme="blue" mb={2}>
            {tag.name}
          </Tag>
          <Text fontSize="sm" color="gray.600">
            {tag.description}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            {tag.questionCount}件の質問
          </Text>
        </Box>
      ))}
    </VStack>
  );
} 