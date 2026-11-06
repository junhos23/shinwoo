// 이 폴더의 html·svg 파일을 http://localhost:8080 에서 보여 주는 간단한 서버
const http = require("http");
const fs = require("fs");
const path = require("path");

const types = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".css": "text/css", ".js": "text/javascript" };

http.createServer((req, res) => {
  const name = decodeURIComponent(req.url.split("?")[0]).replace(/^\/+/, "") || "index.html";
  const file = path.join(__dirname, path.normalize(name));
  if (!file.startsWith(__dirname) || !types[path.extname(file)]) { res.writeHead(404); return res.end("없는 파일입니다."); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("없는 파일입니다."); }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] });
    res.end(data);
  });
}).listen(8080, () => console.log("http://localhost:8080"));
