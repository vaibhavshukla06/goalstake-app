import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import React, { Suspense } from 'react';

/**
 * Custom hook for queries with proper typing
 */
export function useAppQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options = {}
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * Custom hook for mutations with automatic invalidation
 */
export function useAppMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKeyToInvalidate?: QueryKey,
  options = {}
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // Custom success handling
      if (queryKeyToInvalidate) {
        queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      }
      
      // Call the original onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
}

/**
 * Utility component that wraps content in Suspense with a fallback
 */
export function SuspenseWrapper(props: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return <Suspense fallback={props.fallback}>{props.children}</Suspense>;
} 