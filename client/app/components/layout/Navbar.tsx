'use client';

import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Avatar,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderBottom={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      px={4}
    >
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <Link href="/" passHref>
          <Text
            fontFamily={'heading'}
            fontWeight={'bold'}
            color={useColorModeValue('gray.800', 'white')}
            cursor="pointer"
          >
            マラソンQ&A
          </Text>
        </Link>

        <Flex alignItems={'center'}>
          <Stack direction={'row'} spacing={4}>
            <Link href="/questions" passHref>
              <Button variant={'ghost'}>質問一覧</Button>
            </Link>
            <Link href="/tags" passHref>
              <Button variant={'ghost'}>タグ一覧</Button>
            </Link>

            {user ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rounded={'full'}
                  variant={'link'}
                  cursor={'pointer'}
                  minW={0}
                >
                  <Avatar size={'sm'} name={user.name} />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => router.push(`/profile/${user._id}`)}>
                    プロフィール
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/questions/new')}>
                    質問を投稿
                  </MenuItem>
                  <MenuItem onClick={() => router.push('/bookmarks')}>
                    ブックマーク一覧
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Link href="/login" passHref>
                <Button colorScheme={'blue'}>ログイン</Button>
              </Link>
            )}
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
} 