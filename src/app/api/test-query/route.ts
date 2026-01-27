import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  // Test 1: Simple query without relationships
  const { data: simple, error: simpleError } = await supabase
    .from("assessments")
    .select("id, status, user_id")
    .limit(1);

  // Test 2: Query with assessment_users relationship
  const { data: withUsers, error: usersError } = await supabase
    .from("assessments")
    .select(`
      id,
      status,
      assessment_users!inner(name, organization_name)
    `)
    .limit(1);

  // Test 3: Query with assessment_results relationship
  const { data: withResults, error: resultsError } = await supabase
    .from("assessments")
    .select(`
      id,
      status,
      assessment_results(overall_score, readiness_level)
    `)
    .limit(1);

  // Test 4: Full query (what we use in dashboard)
  const { data: full, error: fullError } = await supabase
    .from("assessments")
    .select(`
      id,
      status,
      assessment_users!inner(
        name, 
        organization_name
      ),
      assessment_results(
        overall_score, 
        readiness_level
      )
    `)
    .limit(1);

  return NextResponse.json({
    test1_simple: { data: simple, error: simpleError },
    test2_with_users: { data: withUsers, error: usersError },
    test3_with_results: { data: withResults, error: resultsError },
    test4_full_query: { data: full, error: fullError }
  }, { status: 200 });
}