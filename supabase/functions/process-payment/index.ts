// Supabase Edge Function for Secure Payment Processing
// This function handles payment processing for challenge stakes in a secure environment

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5'
import { corsHeaders } from '../_shared/cors.ts'

// Mock payment processor - in production, replace with real payment processor SDK
// For example: import Stripe from 'https://esm.sh/stripe@12.11.0'
const mockPaymentProcessor = {
  createPayment: async (amount: number, currency: string, metadata: any) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Simulate success rate (95% success, 5% failure)
    const success = Math.random() > 0.05
    
    if (success) {
      return {
        id: `pmt_${crypto.randomUUID().replace(/-/g, '')}`,
        status: 'succeeded',
        amount,
        currency,
        metadata
      }
    } else {
      throw new Error('Payment processing failed')
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get request body
    const requestData = await req.json()
    const { amount, user_id, challenge_id, stake_id } = requestData
    
    // Validate required parameters
    if (!amount || !user_id || !challenge_id || !stake_id) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: amount, user_id, challenge_id, and stake_id are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid amount: must be a positive number' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Initialize Supabase client with auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    // Get user to verify they exist
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('id, balance')
      .eq('id', user_id)
      .single()
      
    if (userError || !userData) {
      return new Response(JSON.stringify({ 
        error: 'User not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Get challenge to verify it exists
    const { data: challengeData, error: challengeError } = await supabaseClient
      .from('challenges')
      .select('id, title, status')
      .eq('id', challenge_id)
      .single()
      
    if (challengeError || !challengeData) {
      return new Response(JSON.stringify({ 
        error: 'Challenge not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Verify the challenge is active
    if (challengeData.status !== 'active' && challengeData.status !== 'pending') {
      return new Response(JSON.stringify({ 
        error: `Cannot process payment for ${challengeData.status} challenge` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Verify user has sufficient balance
    if (userData.balance < amount) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient balance' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Begin database transaction
    const { error: transactionError } = await supabaseClient.rpc('begin_transaction')
    if (transactionError) {
      return new Response(JSON.stringify({ 
        error: 'Failed to start transaction', 
        details: transactionError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    try {
      // Process payment with mock payment processor
      // In production, this would call a real payment processor API
      const paymentResult = await mockPaymentProcessor.createPayment(amount, 'USD', {
        user_id,
        challenge_id,
        stake_id
      })
      
      // Create transaction record
      const { data: transactionData, error: insertError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id,
          type: 'stake',
          amount,
          status: 'completed',
          metadata: {
            challenge_id,
            stake_id,
            payment_id: paymentResult.id
          }
        })
        .select()
        .single()
        
      if (insertError) {
        // Roll back transaction on error
        await supabaseClient.rpc('rollback_transaction')
        
        return new Response(JSON.stringify({ 
          error: 'Failed to create transaction record', 
          details: insertError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Update user balance
      const { error: balanceError } = await supabaseClient
        .from('profiles')
        .update({ balance: userData.balance - amount })
        .eq('id', user_id)
        
      if (balanceError) {
        // Roll back transaction on error
        await supabaseClient.rpc('rollback_transaction')
        
        return new Response(JSON.stringify({ 
          error: 'Failed to update user balance', 
          details: balanceError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Update stake status
      const { error: stakeError } = await supabaseClient
        .from('stakes')
        .update({ status: 'active', payment_id: paymentResult.id })
        .eq('id', stake_id)
        
      if (stakeError) {
        // Roll back transaction on error
        await supabaseClient.rpc('rollback_transaction')
        
        return new Response(JSON.stringify({ 
          error: 'Failed to update stake status', 
          details: stakeError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Commit transaction
      const { error: commitError } = await supabaseClient.rpc('commit_transaction')
      if (commitError) {
        // Try to roll back if commit fails
        await supabaseClient.rpc('rollback_transaction')
        
        return new Response(JSON.stringify({ 
          error: 'Failed to commit transaction', 
          details: commitError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Return success response
      return new Response(JSON.stringify({
        success: true,
        transaction_id: transactionData.id,
        payment_id: paymentResult.id,
        amount,
        status: 'completed'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
      
    } catch (error) {
      // Roll back transaction on any error
      await supabaseClient.rpc('rollback_transaction')
      
      return new Response(JSON.stringify({ 
        error: 'Payment processing failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
  } catch (error) {
    // Handle any unexpected errors
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 