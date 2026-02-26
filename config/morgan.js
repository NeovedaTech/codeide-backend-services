import chalk from "chalk";
import morgan from "morgan";

export const statusColor = (status) => {
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  return chalk.green(status);
};

export const methodColor = (method) => {
  const map = {
    GET: chalk.green,
    POST: chalk.blue,
    PUT: chalk.yellow,
    PATCH: chalk.magenta,
    DELETE: chalk.red,
  };

  return (map[method] || chalk.white)(method);
};

export const setupMorgan = (app) => {
  /* ---------- Custom tokens ---------- */

  morgan.token("remote-ip", (req) =>
    req.headers["x-forwarded-for"] || req.socket.remoteAddress,
  );

  morgan.token("statusColor", (req, res) =>
    statusColor(res.statusCode),
  );

  morgan.token("methodColor", (req) =>
    methodColor(req.method),
  );

  morgan.token("urlColor", (req) =>
    chalk.white(req.originalUrl),
  );

  /* ---------- Log format ---------- */

  const format =
    `${chalk.gray(":date[iso]")} | ` +
    `${chalk.cyan(":remote-ip")} | ` +
    `:methodColor :urlColor | ` +
    `:statusColor | ` +
    `${chalk.magenta(":res[content-length]")} bytes | ` +
    `${chalk.gray(":response-time ms")} | ` +
    `${chalk.gray('":user-agent"')}`;

  /* ---------- Attach middleware ---------- */

  if (process.env.NODE_ENV !== "PROD") {
    // Only log errors in prod
    app.use(
      morgan(format, {
        skip: (req, res) => res.statusCode < 400,
      }),
    );
  } else {
    // Full logs in dev
    app.use(morgan(format));
  }
};
