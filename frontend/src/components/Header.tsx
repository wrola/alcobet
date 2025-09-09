import React from 'react';
import { Link } from 'react-router-dom';
import { Group, Text, Button, Box } from '@mantine/core';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box px="md" style={{ height: '64px', display: 'flex', alignItems: 'center' }}>
      <Group justify="space-between" w="100%" maw="1200px" mx="auto">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Text size="xl" fw={700} c="brand">
            AlcoBet
          </Text>
        </Link>

        <Group gap="md">
          {user ? (
            <>
              <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                <Button variant="subtle" color="gray">
                  Dashboard
                </Button>
              </Link>
              <Link to="/create-bet" style={{ textDecoration: 'none' }}>
                <Button color="brand">
                  Create Bet
                </Button>
              </Link>
              <Group gap="sm">
                <Text size="sm" c="dimmed">Hi, {user.name}</Text>
                <Button variant="subtle" size="sm" color="gray" onClick={logout}>
                  Logout
                </Button>
              </Group>
            </>
          ) : (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button color="brand">
                Get Started
              </Button>
            </Link>
          )}
        </Group>
      </Group>
    </Box>
  );
};

export default Header;