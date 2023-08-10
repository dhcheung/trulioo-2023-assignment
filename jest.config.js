/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'tests'
};

process.env = Object.assign(process.env, {
  MONGO_URI: 'mongodb://127.0.0.1:27017/login-service',
  JWT_SECRET: 'eec0a89634741e2e91b1a3db485ae67c',
});