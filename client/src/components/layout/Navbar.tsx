'use client';

import { Box, Container, HStack, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <Box bg="white" py={4} shadow="sm">
      <Container maxW="container.lg">
        <HStack justify="space-between">
          <HStack spacing={8}>
            <Button variant="ghost" onClick={() => router.push('/')}>
              ホーム
            </Button>
            <Button variant="ghost" onClick={() => router.push('/tags')}>
              タグ一覧
            </Button>
          </HStack>

          {user ? (
            <Menu>
              <MenuButton as={Button}>
                {user.username}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => router.push('/questions/new')}>
                  質問を投稿
                </MenuItem>
                <MenuItem onClick={() => router.push('/bookmarks')}>
                  ブックマーク一覧
                </MenuItem>
                <MenuItem onClick={() => router.push(`/profile/${user.id}`)}>
                  プロフィール
                </MenuItem>
                <MenuItem onClick={logout}>
                  ログアウト
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button colorScheme="blue" onClick={() => router.push('/login')}>
              ログイン
            </Button>
          )}
        </HStack>
      </Container>
    </Box>
  );
} 