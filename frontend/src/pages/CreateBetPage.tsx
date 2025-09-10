import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, TextInput, NumberInput, Alert, Title, Text, Card, Group, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar, IconMail, IconCurrencyDollar } from '@tabler/icons-react';
import Layout from '../components/Layout';
import { useBets } from '../hooks/useBets';
import type { CreateBetDto } from '../types';

const CreateBetPage: React.FC = () => {
  const navigate = useNavigate();
  const { createBet, loading } = useBets();

  const form = useForm<CreateBetDto>({
    initialValues: {
      trustmanEmail: '',
      amount: 0,
      deadline: '',
    },
    validate: {
      trustmanEmail: (value) => {
        if (!value) return 'Trustman email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return null;
      },
      amount: (value) => {
        if (!value || value <= 0) return 'Amount must be greater than $0';
        if (value > 10000) return 'Amount cannot exceed $10,000';
        return null;
      },
      deadline: (value) => {
        if (!value) return 'Deadline is required';
        const selectedDate = new Date(value);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        if (selectedDate < tomorrow) return 'Deadline must be at least tomorrow';
        return null;
      },
    },
  });

  const handleSubmit = async (values: CreateBetDto) => {
    try {
      const success = await createBet(values);
      if (success) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      form.setFieldError('submit', error.response?.data?.message || 'Failed to create bet. Please try again.');
    }
  };

  return (
    <Layout>
      <Stack maw={800} mx="auto" gap="xl">
        {/* Header */}
        <Stack align="center" gap="md">
          <Title order={1} ta="center">Create Your Commitment</Title>
          <Text ta="center" c="dimmed" size="lg">
            Set your financial stake, choose a trusted friend, and commit to your sobriety journey.
          </Text>
        </Stack>

        {/* Form */}
        <Card shadow="sm" padding="xl" radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg">
              {/* Trustman Email */}
              <TextInput
                label="Trustman Email"
                placeholder="friend@example.com"
                leftSection={<IconMail size="1rem" />}
                required
                disabled={loading}
                description="Choose someone you trust who will receive daily emails and honestly report if you drank alcohol."
                {...form.getInputProps('trustmanEmail')}
              />

              {/* Amount */}
              <NumberInput
                label="Commitment Amount"
                placeholder="100"
                leftSection={<IconCurrencyDollar size="1rem" />}
                required
                min={1}
                max={10000}
                step={0.01}
                decimalScale={2}
                disabled={loading}
                description="The amount you'll lose if you drink alcohol. Make it meaningful enough to motivate you!"
                {...form.getInputProps('amount')}
              />

              {/* Deadline */}
              <DateInput
                label="Commitment Deadline"
                placeholder="Select date"
                leftSection={<IconCalendar size="1rem" />}
                required
                disabled={loading}
                minDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                description="The date until which you commit to staying alcohol-free."
                valueFormat="YYYY-MM-DD"
                {...form.getInputProps('deadline')}
              />

              {/* Error Message */}
              {form.errors.submit && (
                <Alert color="red">
                  {form.errors.submit}
                </Alert>
              )}

              {/* Buttons */}
              <Group grow>
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <Button variant="filled" color="gray" size="lg" fullWidth>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  loading={loading}
                  color="brand"
                  size="lg"
                >
                  Create Commitment
                </Button>
              </Group>
            </Stack>
          </form>

          {/* Info Box */}
          <Card mt="xl" bg="blue.0" withBorder>
            <Title order={4} c="blue.9" mb="sm">What happens next?</Title>
            <Stack gap="xs">
              <Text size="sm" c="blue.8">• Your trustman will receive an email notification about your commitment</Text>
              <Text size="sm" c="blue.8">• Starting tomorrow, they'll get daily emails asking if you stayed alcohol-free</Text>
              <Text size="sm" c="blue.8">• Your dashboard will show your progress and daily check responses</Text>
              <Text size="sm" c="blue.8">• If you drink alcohol before the deadline, you'll lose your committed amount</Text>
              <Text size="sm" c="blue.8">• Stay clean until the deadline and you get your money back!</Text>
            </Stack>
          </Card>
        </Card>
      </Stack>
    </Layout>
  );
};

export default CreateBetPage;