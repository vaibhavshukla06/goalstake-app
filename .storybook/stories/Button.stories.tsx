import React from 'react';
import { View } from 'react-native';
import { Button } from '../../components/Button';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    notes: 'A customizable button component that supports various styles and states',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
    iconPosition: {
      control: { type: 'radio' },
      options: ['left', 'right'],
    },
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, flex: 1, justifyContent: 'center' }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    variant: 'primary',
    size: 'medium',
    onPress: () => console.log('Primary button pressed'),
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    variant: 'secondary',
    size: 'medium',
    onPress: () => console.log('Secondary button pressed'),
  },
};

export const Outline: Story = {
  args: {
    title: 'Outline Button',
    variant: 'outline',
    size: 'medium',
    onPress: () => console.log('Outline button pressed'),
  },
};

export const Ghost: Story = {
  args: {
    title: 'Ghost Button',
    variant: 'ghost',
    size: 'medium',
    onPress: () => console.log('Ghost button pressed'),
  },
};

export const Small: Story = {
  args: {
    title: 'Small Button',
    variant: 'primary',
    size: 'small',
    onPress: () => console.log('Small button pressed'),
  },
};

export const Medium: Story = {
  args: {
    title: 'Medium Button',
    variant: 'primary',
    size: 'medium',
    onPress: () => console.log('Medium button pressed'),
  },
};

export const Large: Story = {
  args: {
    title: 'Large Button',
    variant: 'primary',
    size: 'large',
    onPress: () => console.log('Large button pressed'),
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    variant: 'primary',
    size: 'medium',
    disabled: true,
    onPress: () => console.log('Disabled button pressed'),
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Button',
    variant: 'primary',
    size: 'medium',
    loading: true,
    onPress: () => console.log('Loading button pressed'),
  },
}; 