const c = require('ansi-colors');

const woffu = require('./woffu');

function formatSignedIn(signedIn) {
  if (signedIn) return c.greenBright('STARTED');
  return c.redBright('STOPPED');
}


async function getCredentials() {
  const user = process.env.WOFFU_USERNAME;
  const password = process.env.WOFFU_PASSWORD;
  const token = await woffu.login(user, password);
  const domain = await woffu.getDomain(token);
  return { token, domain };
}

async function toggleSign() {
  const credentials = await getCredentials();
  const result = await woffu.toggleSign(credentials.domain, credentials.token);
  console.log(`You just ${formatSignedIn(result.signedIn)} working.`);
}

module.exports = async () => {
  await toggleSign();
};
