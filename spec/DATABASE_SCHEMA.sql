-- Alcohol Abstinence Betting App Database Schema
-- SQLite Database with TypeORM

-- Users table for Google OAuth authenticated users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  google_id TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bets table for user commitments
CREATE TABLE bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trustman_email TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  deadline DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily checks table for trustman responses
CREATE TABLE daily_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bet_id INTEGER NOT NULL,
  check_date DATE NOT NULL,
  response TEXT CHECK (response IN ('clean', 'drank') OR response IS NULL),
  response_token TEXT UNIQUE,
  responded_at DATETIME,
  email_sent_at DATETIME,
  FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE,
  UNIQUE(bet_id, check_date)
);

-- Indexes for performance
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_daily_checks_bet_id ON daily_checks(bet_id);
CREATE INDEX idx_daily_checks_token ON daily_checks(response_token);
CREATE INDEX idx_daily_checks_date ON daily_checks(check_date);

-- Sample data for testing
INSERT INTO users (email, name, google_id) VALUES
('john@example.com', 'John Doe', 'google_123456789'),
('jane@example.com', 'Jane Smith', 'google_987654321');

INSERT INTO bets (user_id, trustman_email, amount, deadline, status) VALUES
(1, 'trustman@example.com', 100.00, '2024-12-31', 'active'),
(2, 'friend@example.com', 50.00, '2024-11-30', 'active');

INSERT INTO daily_checks (bet_id, check_date, response_token, email_sent_at) VALUES
(1, '2024-01-15', 'uuid-token-123', '2024-01-15 09:00:00'),
(2, '2024-01-15', 'uuid-token-456', '2024-01-15 09:00:00');