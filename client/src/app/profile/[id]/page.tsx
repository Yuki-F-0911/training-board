'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import api from '../../../lib/axios';
import QuestionCard from '../../../components/questions/QuestionCard';
import { useAuth } from '../../../hooks/useAuth';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  questions?: any[];
  answers?: any[];
}

export default function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 現在ログインしているユーザー自身のプロファイルを表示する場合
      if (user && user.id === params.id) {
        console.log('現在のユーザープロファイルを表示します');
        const response = await api.get('/auth/me');
        setProfile({
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          // 質問と回答の情報は別途取得する必要がある
          questions: [],
          answers: []
        });
      } else {
        // 他のユーザーのプロファイルを表示する場合（現在は実装されていない）
        setError('他のユーザーのプロファイル表示は現在対応していません');
      }
    } catch (error) {
      console.error('プロファイル取得エラー:', error);
      setError('プロファイルの取得に失敗しました');
      toast({
        title: 'エラー',
        description: 'プロファイルの取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <Text>読み込み中...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="warning">
          <AlertIcon />
          プロファイルが見つかりませんでした
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={8}>
        <VStack spacing={4} align="center">
          <Avatar size="2xl" name={profile.username} />
          <Heading size="lg">{profile.username}</Heading>
          {user?.id === profile.id && (
            <Text color="gray.500">{profile.email}</Text>
          )}
        </VStack>
      </Box>

      <StatGroup mb={8}>
        <Stat>
          <StatLabel>質問</StatLabel>
          <StatNumber>{profile.questions?.length || 0}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>回答</StatLabel>
          <StatNumber>{profile.answers?.length || 0}</StatNumber>
        </Stat>
      </StatGroup>

      <Tabs>
        <TabList>
          <Tab>質問</Tab>
          <Tab>回答</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {profile.questions && profile.questions.length > 0 ? (
                profile.questions.map((question) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    onBookmarkToggle={() => {}} 
                  />
                ))
              ) : (
                <Text>質問はまだありません</Text>
              )}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {profile.answers && profile.answers.length > 0 ? (
                profile.answers.map((answer) => (
                  <Box
                    key={answer.id}
                    p={5}
                    borderWidth="1px"
                    borderRadius="lg"
                  >
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      回答先: {answer.question?.title || '不明な質問'}
                    </Text>
                    <Text>{answer.content}</Text>
                  </Box>
                ))
              ) : (
                <Text>回答はまだありません</Text>
              )}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
} 