DROP TABLE IF EXISTS daily;
DROP TABLE IF EXISTS users;

CREATE TABLE  users (
  ID SERIAL PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255)
);

CREATE TABLE daily (
  id SERIAL PRIMARY KEY,
  gratitude VARCHAR,
  date timestamp not null default now(),
  person INT,
  FOREIGN KEY(person) REFERENCES users(ID)
);



INSERT INTO daily (gratitude) VALUES ('learning everyday');