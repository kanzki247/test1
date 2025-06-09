-- Users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Customers 테이블 생성
CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_type VARCHAR(100),
    region VARCHAR(100),
    reg_date DATE,
    industry_type VARCHAR(100),
    country VARCHAR(100),
    company_size VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts 테이블 생성
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    position VARCHAR(100),
    department VARCHAR(100),
    phone VARCHAR(50),
    contact_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Orders 테이블 생성
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(customer_id),
    product_id VARCHAR(100),
    order_date DATE DEFAULT CURRENT_DATE,
    quantity INTEGER,
    amount DECIMAL(15,2),
    cost DECIMAL(15,2),
    margin_rate DECIMAL(5,4),
    payment_status VARCHAR(50),
    delivery_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- OrdersX 테이블 생성 (확장된 주문 테이블)
CREATE TABLE IF NOT EXISTS ordersx (
    order_id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(customer_id),
    product_id VARCHAR(100),
    order_date DATE DEFAULT CURRENT_DATE,
    quantity INTEGER,
    amount DECIMAL(15,2),
    cost DECIMAL(15,2),
    margin_rate DECIMAL(5,4),
    payment_status VARCHAR(50),
    delivery_status VARCHAR(50),
    costt DECIMAL(15,2),
    revenue DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Issues 테이블 생성
CREATE TABLE IF NOT EXISTS issues (
    issue_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    issue_date DATE DEFAULT CURRENT_DATE,
    issue_type VARCHAR(100),
    severity VARCHAR(50),
    description TEXT,
    resolved_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Customer Order Forecast 테이블 생성
CREATE TABLE IF NOT EXISTS customer_order_forecast (
    cof_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(customer_id),
    predicted_date DATE,
    predicted_quantity INTEGER,
    mape DECIMAL(10,6),
    prediction_model VARCHAR(100),
    forecast_generation_datetime TIMESTAMP DEFAULT NOW()
);
