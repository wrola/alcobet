import React from 'react';
import { Card, Text, Badge, Group, Stack, Progress, Tooltip, Title, Box } from '@mantine/core';
import type { Bet } from '../types';
import { formatCurrency, formatDateShort, calculateProgress, getBetStatusBadgeColor, getBetStatusText } from '../utils/formatters';

interface BetCardProps {
  bet: Bet;
}

const BetCard: React.FC<BetCardProps> = ({ bet }) => {
  const { currentDay, totalDays, percentage } = calculateProgress(bet.createdAt, bet.deadline);
  const statusBadgeColor = getBetStatusBadgeColor(bet.status);
  const statusText = getBetStatusText(bet.status);

  // Calculate recent daily checks status
  const recentChecks = bet.dailyChecks
    .slice(-7)
    .sort((a, b) => new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime());

  const cleanDays = bet.dailyChecks.filter(check => check.response === 'clean').length;
  const totalResponses = bet.dailyChecks.filter(check => check.response !== null).length;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ transition: 'box-shadow 0.2s' }}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Title order={4}>
            {formatCurrency(bet.amount)} Commitment
          </Title>
          <Badge color={statusBadgeColor} size="sm">
            {statusText}
          </Badge>
        </Group>

        {/* Details */}
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Trustman:</Text>
            <Text size="sm">{bet.trustmanEmail}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Deadline:</Text>
            <Text size="sm">{formatDateShort(bet.deadline)}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Progress:</Text>
            <Text size="sm">Day {currentDay} of {totalDays}</Text>
          </Group>
        </Stack>

        {bet.status === 'active' && (
          <>
            {/* Progress Bar */}
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Progress</Text>
                <Text size="sm" c="dimmed">{percentage.toFixed(1)}%</Text>
              </Group>
              <Progress value={percentage} color="brand" />
            </Stack>

            {/* Recent Checks */}
            {recentChecks.length > 0 && (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Recent Days</Text>
                  <Text size="sm" c="dimmed">{cleanDays}/{totalResponses} clean</Text>
                </Group>
                <Group gap="xs">
                  {recentChecks.map((check) => (
                    <Tooltip
                      key={check.id}
                      label={`${formatDateShort(check.checkDate)}: ${check.response || 'No response'}`}
                    >
                      <Box
                        w={16}
                        h={16}
                        style={{
                          borderRadius: '50%',
                          backgroundColor: 
                            check.response === 'clean' ? 'var(--mantine-color-green-6)' :
                            check.response === 'drank' ? 'var(--mantine-color-red-6)' :
                            'var(--mantine-color-gray-4)'
                        }}
                      />
                    </Tooltip>
                  ))}
                </Group>
              </Stack>
            )}
          </>
        )}

        <Text size="xs" c="dimmed">
          Started {formatDateShort(bet.createdAt)}
        </Text>
      </Stack>
    </Card>
  );
};

export default BetCard;