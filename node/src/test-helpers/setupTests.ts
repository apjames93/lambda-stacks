import HttpRequestMock from 'http-request-mock';

const ogEnv = process.env;
let mocker;

// eslint-disable-next-line no-undef
beforeAll(async () => {
  mocker = HttpRequestMock.setup();
});

// eslint-disable-next-line no-undef
afterAll(async () => {
  process.env = ogEnv;
  mocker.reset();
});
