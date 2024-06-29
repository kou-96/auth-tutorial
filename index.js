const express = require("express");
const pool = require("./db");

const app = express();
const PORT = 5001;

app.use(express.json());

app.get("/", (req, res) => {
  pool.query("SELECT * FROM users", (errors, results) => {
    if (errors) throw errors;
    return res.status(200).json(results.rows);
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  pool.query(
    "SELECT email, password FROM users WHERE email = $1",
    [email],
    (error, results) => {
      if (error) throw error;

      // 渡されたemailに対してユーザーが存在しない時。
      if (results.rowCount === 0 || null) {
        return res.status(404).send("ユーザーが存在しません");
      }

      //ユーザーのパスワードが一致しない時。
      const user = results.rows[0];
      if (user.password !== password) {
        return res.status(401).send("パスワードは違います");
      }

      //両方一致した時。
      return res.status(200).send("ログインに成功しました");
    }
  );
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).send("メールアドレスを入力してください");
  if (!password) return res.status(400).send("パスワードを入力してください");

  pool.query(
    "SELECT email FROM users WHERE email = $1",
    [email],
    (error, response) => {
      if (error) throw error;

      if (response.rowCount > 0)
        return res.status(409).send("既にユーザーが存在しています");
    }
  );

  pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, password],
    (error) => {
      if (error) throw error;

      return res.status(200).send("ユーザ作成に成功しました");
    }
  );
});

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
