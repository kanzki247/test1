-- 관리자 계정을 Supabase Auth에 등록하고 users 테이블에도 추가

-- 1. 먼저 users 테이블에 관리자 정보 삽입
INSERT INTO users (user_id, name, email, role) VALUES
('admin', '관리자', 'admin@company.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 2. 추가로 테스트용 사용자도 등록
INSERT INTO users (user_id, name, email, role) VALUES
('user1', '김철수', 'kim@company.com', 'staff')
ON CONFLICT (email) DO NOTHING;

-- 참고: Supabase Auth에는 별도로 계정을 생성해야 합니다.
-- 다음 단계를 따라주세요:
-- 1. Supabase Dashboard > Authentication > Users로 이동
-- 2. "Add user" 버튼 클릭
-- 3. Email: admin@company.com, Password: admin123 입력하여 생성
-- 4. Email: kim@company.com, Password: user123 입력하여 생성 (선택사항)
