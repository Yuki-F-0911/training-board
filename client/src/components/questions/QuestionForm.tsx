'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  useToast,
  Switch,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const QuestionForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [useAI, setUseAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = useAI
        ? 'http://localhost:5000/api/ai/generate-question'
        : 'http://localhost:5000/api/questions';

      const response = await axios.post(endpoint, {
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()),
        topic: 'マラソントレーニング',
      });

      toast({
        title: '投稿成功',
        description: '質問が投稿されました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/questions');
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
            <FormLabel>タイトル</FormLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="質問のタイトルを入力してください"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>内容</FormLabel>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="質問の内容を詳しく入力してください"
              minH="200px"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>タグ</FormLabel>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="カンマ区切りでタグを入力（例: マラソン,トレーニング,初心者）"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">
              AIを使用して質問を生成する
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
            質問を投稿
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default QuestionForm; 