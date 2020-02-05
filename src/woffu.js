const request = require('request');
const jwt = require('jsonwebtoken');
const repo = require('./repository')();

const APP_DOMAIN = 'app.woffu.com';

function buildUrl(domain, path) {
  return `https://${domain}${path}`;
}

function buildAuthorizedHeaders(domain, token) {
  return {
    'Content-Type': 'application/json;charset=utf8',
    Host: domain,
    Referer: `https://${domain}/`,
    Authorization: `Bearer ${token}`,
  };
}

function getUserIdFromToken(token) {
  return jwt.decode(token).UserId;
}

function getCompanyIdFromToken(token) {
  return jwt.decode(token).CompanyId;
}

function parseSignResponse(body) {
  return {
    signedIn: body.SignIn,
  };
}

function toggleSign(domain, token) {
  return new Promise(async (resolve, reject) => {
    console.log('toggling sign in');
    const afterToggle = await repo.toggleStatus();
    const logs = await repo.getSignInLogs();
    resolve({ signedIn: true });
  });
  // return new Promise((resolve, reject) => {
  //
  //     const options = {
  //       url: buildUrl(domain, '/api/signs'),
  //       method: 'POST',
  //       headers: buildAuthorizedHeaders(domain, token),
  //       body: {
  //         "TimezoneOffset": new Date().getTimezoneOffset(),
  //         "UserId": getUserIdFromToken(token)
  //       },
  //       json: true
  //     };
  //
  //     request(options, (err, _, body) => {
  //       if (err) return reject(err);
  //       resolve(parseSignResponse(body));
  //     });
  //
  // });
}

function getSigns(domain, token) {
  return new Promise((resolve, reject) => {
    const options = {
      url: buildUrl(domain, '/api/signs'),
      method: 'GET',
      headers: buildAuthorizedHeaders(domain, token),
      json: true,
    };

    request(options, (err, _, body) => {
      if (err) return reject(err);
      resolve(body);
    });
  });
}

function getSchedule(domain, token) {
  return new Promise((resolve, reject) => {
    const userId = getUserIdFromToken(token);
    const options = {
      url: buildUrl(domain, `/api/users/${userId}/workday`),
      method: 'GET',
      headers: buildAuthorizedHeaders(domain, token),
      json: true,
    };

    request(options, (err, _, body) => {
      if (err) return reject(err);
      resolve(body);
    });
  });
}

function getDomain(token) {
  return new Promise((resolve, reject) => {
    const companyId = getCompanyIdFromToken(token);
    const options = {
      url: buildUrl(APP_DOMAIN, `/api/companies/${companyId}`),
      method: 'GET',
      headers: buildAuthorizedHeaders(APP_DOMAIN, token),
      json: true,
    };

    request(options, (err, _, body) => {
      if (err) return reject(err);
      resolve(body.Domain);
    });
  });
}

function login(user, password) {
  return new Promise((resolve, reject) => {
    const options = {
      url: buildUrl(APP_DOMAIN, '/Token'),
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf8',
        Host: 'app.woffu.com',
        Referer: 'https://app.woffu.com/',
      },
      body: `grant_type=password&username=${user}&password=${password}`,
    };

    request(options, (err, _, body) => {
      if (err) {
        return reject(err);
      }

      const result = JSON.parse(body);
      if (result.error) {
        reject(new Error(result.error_description));
      } else {
        resolve(result.access_token);
      }
    });
  });
}

module.exports = {
  toggleSign,
  getSigns,
  getSchedule,
  login,
  getDomain,
};
