import { createClient } from "@supabase/supabase-js"

// ✅ Supabase 프로젝트 URL
const supabaseUrl = "https://xrjivztqnujokhydrcmb.supabase.co"

// ✅ 익명 사용자용 키 (브라우저에서 안전하게 사용 가능)
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyaml2enRxbnVqb2toeWRyY21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mjg5ODAsImV4cCI6MjA2NTEwNDk4MH0.12CbY5IpUJ4ptWGlnFWf6pmGEV9UssfjwSKJq5Pn3P8"

// ✅ 서버 사이드 관리자 키 (절대 브라우저에 노출 금지!)
const supabaseServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyaml2enRxbnVqb2toeWRyY21iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTUyODk4MCwiZXhwIjoyMDY1MTA0OTgwfQ.s87ZO4kFgtoYyBN6prZIOdgFps8S2Sh_tVIje7ZFmng"

// 🔹 클라이언트에서 사용하는 Supabase 인스턴스
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 🔸 서버사이드에서만 사용하는 Supabase 인스턴스 (관리 권한)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)



//import { createClient } from "@supabase/supabase-js"

//const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
//const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

//export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 서버 사이드용 클라이언트 (Service Role Key 사용)
//export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
