'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  useToast,
  Switch,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import apiClient from '../../lib/axios';

interface AnswerFormProps {
  questionId: string;
}

const AnswerForm = ({ questionId }: AnswerFormProps) => {
  const [content, setContent] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = useAI
        ? `/ai/generate-answer/${questionId}`
        : `/questions/${questionId}/answers`;

      const response = await apiClient.post(endpoint, {
        content,
      });

      toast({
        title: '投稿成功',
        description: '回答が投稿されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/questions/${questionId}`);
    } catch (error: any) {
      toast({
        title: 'エラー',
        description: error.response?.data?.message || '投稿に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="2xl" mx="auto" mt={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>回答内容</FormLabel>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="回答を詳しく入力してください"
              minH="200px"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">
              AIを使用して回答を生成する
            </FormLabel>
            <Switch
              isChecked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
          >
            回答を投稿
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default AnswerForm; 