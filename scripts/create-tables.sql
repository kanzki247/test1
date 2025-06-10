-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 저장 프로시저 생성 (테이블 자동 생성용)
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'users'
  ) THEN
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 기타 필요한 테이블들 생성
CREATE TABLE IF NOT EXISTS contacts (
  contact_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  company_type TEXT,
  contact_id INTEGER REFERENCES contacts(contact_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ordersx (
  order_id SERIAL PRIMARY KEY,
  contact_id INTEGER REFERENCES contacts(contact_id),
  product_id INTEGER,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  quantity INTEGER,
  amount NUMERIC(10, 2),
  cost NUMERIC(10, 2),
  margin_rate NUMERIC(5, 2),
  payment_status TEXT,
  delivery_status TEXT,
  costt NUMERIC(10, 2),
  revenue NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS customer_order_forecast (
  cof_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  predicted_date DATE,
  predicted_quantity INTEGER,
  mape NUMERIC(10, 2),
  prediction_model TEXT,
  forecast_generation_datetime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issues (
  issue_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  assigned_to TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
