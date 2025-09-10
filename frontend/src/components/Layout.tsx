import React, { type ReactNode } from 'react';
import { AppShell, Container } from '@mantine/core';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <AppShell
      header={{ height: 64 }}
      padding="md"
      style={{ minHeight: '100vh' }}
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>
      
      <AppShell.Main>
        <Container size="xl" py="md">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;