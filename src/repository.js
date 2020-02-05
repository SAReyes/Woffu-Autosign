const sqlite3 = require('sqlite3').verbose();

class Repository {
  constructor() {
    this.user = process.env.WOFFU_USERNAME;
    this.db = new sqlite3.Database('./woffu_sigin.db', (err) => {
      if (err) {
        return console.error(err.message);
      }
      console.log('Connected to the in-memory SQlite database.');
    });

    this._run(`
    CREATE TABLE IF NOT EXISTS EmployeeStatus (
      email TEXT PRIMARY KEY,
      signedIn INTEGER
    )`);
    this._run(`
    CREATE TABLE IF NOT EXISTS SignInLog (
      email TEXT,
      newSignInStatus INTEGER,
      createdDate datetime default current_timestamp
    )`);
  }

  async toggleStatus() {
    const { signedIn: currentSignedInStatus } = await this._getUserStatus();
    await this._updateStatus(!currentSignedInStatus);
    await this._logSignIn(!currentSignedInStatus);
    return !currentSignedInStatus;
  }

  getSignInLogs() {
    return new Promise(((resolve, reject) => {
      this.db.all('SELECT * FROM SignInLog', (err, rows) => {
        if (err) return reject(err);

        resolve(rows);
      })
    }))
  }

  async _logSignIn(status) {
    await this._run('INSERT INTO SignInLog (email, newSignInStatus) VALUES (?, ?)', [this.user, status]);
  }

  _updateStatus(status) {
    return this._run('UPDATE EmployeeStatus SET signedIn = ? WHERE email = ?', [status, this.user]);
  }

  _run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log(`Error running sql ${sql}`);
          console.log(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  _getUserStatus() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT signedIn FROM EmployeeStatus', async (err, rows) => {
        if (err) return reject(err);

        if (!rows.length) {
          await this._run('INSERT INTO EmployeeStatus (email, signedIn) VALUES (?, ?)', [this.user, false]);
          resolve({ signedIn: false });
        } else {
          resolve({ signedIn: !!rows[0].signedIn });
        }
      });
    });
  }
}

module.exports = () => new Repository();
