'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  HStack,
  Badge,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

interface Notification {
  _id: string;
  type: 'answer' | 'mention' | 'like';
  actor: {
    _id: string;
    name: string;
  };
  question?: {
    _id: string;
    title: string;
  };
  answer?: {
    _id: string;
    content: string;
  };
  read: boolean;
  createdAt: string;
}

const NotificationList = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      toast({
        title: 'エラー',
        description: '通知の取得に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${notificationId}/read`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('通知の既読処理に失敗しました:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    if (notification.question) {
      router.push(`/questions/${notification.question._id}`);
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'answer':
        return `${notification.actor.name}さんがあなたの質問に回答しました`;
      case 'mention':
        return `${notification.actor.name}さんがあなたにメンションしました`;
      case 'like':
        return `${notification.actor.name}さんがあなたの回答にいいねしました`;
      default:
        return '';
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {notifications.map((notification) => (
        <Box
          key={notification._id}
          p={4}
          borderWidth="1px"
          borderRadius="lg"
          cursor="pointer"
          onClick={() => handleNotificationClick(notification)}
          bg={notification.read ? 'transparent' : 'blue.50'}
          _hover={{ shadow: 'md' }}
        >
          <HStack spacing={4}>
            <Avatar size="sm" name={notification.actor.name} />
            <Box flex="1">
              <Text>{getNotificationText(notification)}</Text>
              {notification.question && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  質問: {notification.question.title}
                </Text>
              )}
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: ja,
                })}
              </Text>
            </Box>
            {!notification.read && (
              <Badge colorScheme="blue">新着</Badge>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default NotificationList; 