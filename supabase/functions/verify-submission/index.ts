// Supabase Edge Function for Verification Processing
// This function handles verification submissions with AI-assisted validation

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5'
import { corsHeaders } from '../_shared/cors.ts'

// Helper function to validate image proof using mock AI service
// In production, this would connect to a real AI/ML service
const mockImageValidator = {
  validateImage: async (imageUrl: string, challengeType: string) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 700))
    
    // Mock validation result
    const validationResults = {
      isValid: Math.random() > 0.1, // 90% chance of success
      confidence: Math.random() * 0.5 + 0.5, // Between 0.5 and 1.0
      detectedObjects: ['person', 'indoor', 'exercise'],
      analysis: {
        timestamp: {
          detected: true,
          matches: true
        },
        location: {
          detected: Math.random() > 0.3,
          matches: Math.random() > 0.2
        },
        activity: {
          detected: true,
          matches: challengeType.includes('fitness')
        }
      }
    }
    
    return validationResults
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
    const { verification_id, challenge_id, participant_id, proof_url, proof_type } = requestData
    
    // Validate required parameters
    if (!verification_id || !challenge_id || !participant_id || !proof_url || !proof_type) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters',
        details: 'verification_id, challenge_id, participant_id, proof_url, and proof_type are required'
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
    
    // Get the verification record
    const { data: verificationData, error: verificationError } = await supabaseClient
      .from('verifications')
      .select('id, status, challenge_id, participant_id')
      .eq('id', verification_id)
      .single()
      
    if (verificationError || !verificationData) {
      return new Response(JSON.stringify({
        error: 'Verification not found',
        details: verificationError?.message || 'The verification record could not be found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Check if verification is already processed
    if (verificationData.status !== 'pending') {
      return new Response(JSON.stringify({
        error: 'Verification already processed',
        status: verificationData.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Get challenge info for verification rules
    const { data: challengeData, error: challengeError } = await supabaseClient
      .from('challenges')
      .select('id, title, type, category')
      .eq('id', challenge_id)
      .single()
      
    if (challengeError || !challengeData) {
      return new Response(JSON.stringify({
        error: 'Challenge not found',
        details: challengeError?.message || 'The challenge could not be found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Validate proof based on type
    let validationResult;
    let isValid = false;
    let confidenceScore = 0;
    let analysisReport = {};
    
    switch (proof_type) {
      case 'image':
        // Validate image proof
        validationResult = await mockImageValidator.validateImage(
          proof_url, 
          challengeData.category
        )
        
        isValid = validationResult.isValid;
        confidenceScore = validationResult.confidence;
        analysisReport = {
          ai_confidence: validationResult.confidence,
          detected_objects: validationResult.detectedObjects,
          timestamp_valid: validationResult.analysis.timestamp.matches,
          location_detected: validationResult.analysis.location.detected,
          location_valid: validationResult.analysis.location.matches,
          activity_match: validationResult.analysis.activity.matches
        };
        break;
        
      case 'text':
        // For text proofs, we're using a simpler validation
        // In production, this could use NLP to validate text
        isValid = true;
        confidenceScore = 0.8;
        analysisReport = {
          ai_confidence: 0.8,
          content_length: proof_url.length,
          has_required_info: true
        };
        break;
        
      default:
        return new Response(JSON.stringify({
          error: 'Unsupported proof type',
          details: `The proof type '${proof_type}' is not supported`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
    
    // Determine verification status based on validation
    const newStatus = isValid && confidenceScore > 0.6 ? 'approved' : 'rejected';
    const statusReason = isValid && confidenceScore > 0.6 
      ? 'Automatically approved by system'
      : `Automatically rejected (confidence: ${confidenceScore.toFixed(2)})`;
    
    // Update verification record with validation results
    const { data: updatedVerification, error: updateError } = await supabaseClient
      .from('verifications')
      .update({
        status: newStatus,
        status_reason: statusReason,
        verified_at: new Date().toISOString(),
        verification_method: 'automated',
        metadata: {
          ...verificationData.metadata || {},
          ai_validation: {
            is_valid: isValid,
            confidence_score: confidenceScore,
            analysis: analysisReport,
            processed_at: new Date().toISOString()
          }
        }
      })
      .eq('id', verification_id)
      .select()
      .single()
      
    if (updateError) {
      return new Response(JSON.stringify({
        error: 'Failed to update verification',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // For approved verifications, update participant progress
    if (newStatus === 'approved') {
      // This will trigger the database function we created earlier
      // to automatically update participant progress
      console.log(`Verification ${verification_id} approved, progress will be updated by trigger`)
    }
    
    // Return the updated verification
    return new Response(JSON.stringify({
      success: true,
      verification: updatedVerification,
      validation_result: {
        status: newStatus,
        is_valid: isValid,
        confidence: confidenceScore,
        analysis: analysisReport
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    // Handle any unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}) 