DROP TABLE IF EXISTS daily;

CREATE TABLE daily (
  id SERIAL PRIMARY KEY,
  gratitude VARCHAR,
  date timestamp not null default now()
);

INSERT INTO daily (gratitude) VALUES ('learning everyday');