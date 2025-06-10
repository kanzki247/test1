-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts 테이블 생성
CREATE TABLE IF NOT EXISTS contacts (
    contact_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customers 테이블 생성
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(contact_id),
    company_name TEXT NOT NULL,
    company_type TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OrdersX 테이블 생성
CREATE TABLE IF NOT EXISTS ordersx (
    order_id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(contact_id),
    product_id INTEGER,
    order_date DATE NOT NULL,
    quantity INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    costt DECIMAL(10,2) NOT NULL,
    revenue DECIMAL(10,2) NOT NULL,
    margin_rate DECIMAL(5,2),
    payment_status TEXT DEFAULT 'pending',
    delivery_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Customer Order Forecast 테이블 생성
CREATE TABLE IF NOT EXISTS customer_order_forecast (
    cof_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    predicted_date DATE NOT NULL,
    predicted_quantity INTEGER NOT NULL,
    mape DECIMAL(5,2),
    prediction_model TEXT,
    forecast_generation_datetime TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Issues 테이블 생성
CREATE TABLE IF NOT EXISTS issues (
    issue_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'medium',
    assigned_to TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders 테이블 생성 (기존 호환성을 위해)
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    product TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
