const pool = require("../config/helpers");
const bcrypt = require("bcryptjs");

function User() {}

User.prototype = {
  // Find user by id or username
  find: function (user = null, callback) {
    // if user = Number return field = id. If user = string return field = username
    if (user) {
      let isEmail = user.indexOf("@");
      var field = Number(isEmail) !== -1 ? "email" : "id";
    }
    if (field) {
      var sql = `SELECT * FROM users WHERE ${field} = ?`;
    } else {
      callback(user);
    }

    pool.query(sql, user, (err, result) => {
      if (err) {
        console.log(err);
        callback(err);
      } else if (result.length > 0) {
        console.log(result[0]);
        callback(result[0]);
      } else {
        callback(null);
      }
    });
  },

  create: function (body, callback) {
    let pwd = body.password;
    body.password = bcrypt.hashSync(pwd, 9);
    let sql = "INSERT INTO users SET ?";
    pool.query(sql, body, (err, lastId) => {
      //   console.log(bind);
      if (err) throw err;
      //   console.log(lastId);
      callback(lastId);
    });
  },

  update: function (body, callback) {
    let id = body[0].toString();
    // console.log("My ID", id);
    this.find("" + id, (user) => {
      if (user) {
        if (body[5] == null) {
          body[5] = user.password;
        } else {
          let pwd = body[5];
          body[5] = bcrypt.hashSync(pwd, 9);
        }

        let sql = `update users SET username=?, fname=?, lname=?, email=?, password=? where id=?`;

        if (body[1] == null) {
          body[1] = user.username;
        }
        if (body[2] == null) {
          body[2] = user.fname;
        }
        if (body[3] == null) {
          body[3] = user.lname;
        }
        if (body[4] == null) {
          body[4] = user.email;
        }
        // if(body[5]==null){
        //   body[5] = user.password;
        // }
        // console.log(user.username);

        pool.query(
          sql,
          [body[1], body[2], body[3], body[4], body[5], id],
          (err, lastId) => {
            //   console.log(bind);
            if (err) throw err;
            // console.log(lastId);
            callback(user);
          }
        );
        return;
      } else {
        callback(null);
      }
    });
  },

  login: function (email, password, callback) {
    this.find(email, (user) => {
      if (user) {
        if (bcrypt.compareSync(password, user.password)) {
          callback(user);
          return;
        }
      }
      callback(null);
    });
  },
};

module.exports = User;
