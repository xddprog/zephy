CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Сначала создаем таблицу users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    avatar TEXT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Затем создаем таблицу streams с ссылкой на users
CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    is_live BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- И наконец создаем таблицу messages с правильными ссылками
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,  -- Убрал NOT NULL для SET NULL
    stream_id UUID NOT NULL REFERENCES streams(id) ON DELETE CASCADE,  -- Изменил на UUID
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Добавляем constraints
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Создаем индексы
CREATE INDEX idx_messages_stream_id ON messages(stream_id);
CREATE INDEX idx_streams_is_live ON streams(is_live) WHERE is_live = true;