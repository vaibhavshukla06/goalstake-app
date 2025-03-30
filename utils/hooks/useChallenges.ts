import { supabase } from '@/services/supabase';
import { Challenge } from '@/types';
import { useAppQuery, useAppMutation } from './useQuery';

/**
 * Custom hook for accessing and managing challenges
 */
export function useChallenges() {
  // Get all challenges
  const getChallenges = async (): Promise<Challenge[]> => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  };

  // Get a specific challenge by ID
  const getChallenge = async (id: string): Promise<Challenge> => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };

  // Create a new challenge
  const createChallenge = async (challenge: Omit<Challenge, 'id'>): Promise<Challenge> => {
    const { data, error } = await supabase
      .from('challenges')
      .insert([challenge])
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };

  // Update an existing challenge
  const updateChallenge = async ({
    id,
    ...updatedData
  }: Partial<Challenge> & { id: string }): Promise<Challenge> => {
    const { data, error } = await supabase
      .from('challenges')
      .update(updatedData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  };

  // Delete a challenge
  const deleteChallenge = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
  };

  // Define query keys
  const challengesKey = ['challenges'];
  const challengeKey = (id: string) => [...challengesKey, id];

  // React Query hooks
  const useChallengesQuery = (options = {}) => 
    useAppQuery(challengesKey, getChallenges, options);

  const useChallengeQuery = (id: string, options = {}) => 
    useAppQuery(challengeKey(id), () => getChallenge(id), options);

  const useCreateChallengeMutation = (options = {}) => 
    useAppMutation(createChallenge, challengesKey, options);

  const useUpdateChallengeMutation = (options = {}) => 
    useAppMutation(updateChallenge, challengesKey, options);

  const useDeleteChallengeMutation = (options = {}) => 
    useAppMutation(deleteChallenge, challengesKey, options);

  return {
    useChallengesQuery,
    useChallengeQuery,
    useCreateChallengeMutation,
    useUpdateChallengeMutation,
    useDeleteChallengeMutation,
  };
} 