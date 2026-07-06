import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

describe('test harness', () => {
  it('renders a React Native tree through the jest-expo preset', async () => {
    await render(<Text>ready</Text>);
    expect(screen.getByText('ready')).toBeTruthy();
  });
});
