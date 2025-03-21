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
} from '@chakra-ui/react';
import axios from 'axios';
import apiClient from '../../../lib/axios';
import QuestionCard from '../../../components/questions/QuestionCard';
import { useAuth } from '../../../hooks/useAuth';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  questions: any[];
  answers: any[];
  createdAt: string;
}

export default function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    fetchProfile();
  }, [params.id]);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get(
        `/users/${params.id}`
      );
      setProfile(response.data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: 'プロフィールの取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={8}>
        <VStack spacing={4} align="center">
          <Avatar size="2xl" name={profile.username} />
          <Heading size="lg">{profile.username}</Heading>
          {user?.id === profile._id && (
            <Text color="gray.500">{profile.email}</Text>
          )}
        </VStack>
      </Box>

      <StatGroup mb={8}>
        <Stat>
          <StatLabel>質問</StatLabel>
          <StatNumber>{profile.questions.length}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>回答</StatLabel>
          <StatNumber>{profile.answers.length}</StatNumber>
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
              {profile.questions.map((question) => (
                <QuestionCard 
                  key={question._id} 
                  question={question} 
                  onBookmarkToggle={() => {}} 
                />
              ))}
            </VStack>
          </TabPanel>
          <TabPanel>
            <VStack spacing={4} align="stretch">
              {profile.answers.map((answer) => (
                <Box
                  key={answer._id}
                  p={5}
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <Text fontSize="sm" color="gray.500" mb={2}>
                    回答先: {answer.question.title}
                  </Text>
                  <Text>{answer.content}</Text>
                </Box>
              ))}
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
} 