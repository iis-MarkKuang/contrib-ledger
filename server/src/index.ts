import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "contrib-ledger" });
});

app.listen(port, () => {
  console.log(`server listening on ${port}`);
});
