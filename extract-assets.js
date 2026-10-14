// Usage: node tools/extract-assets.js path\to\original-invoice.html
// Pulls the embedded logos and signature out of the original single-file HTML
// and saves them into public/images/.
const fs = require("fs"), path = require("path");
const src = process.argv[2];
if (!src) { console.log("Usage: node tools/extract-assets.js <original.html>"); process.exit(1); }
const html = fs.readFileSync(src, "utf8");
const map = { LOGO_L: "logo-left.png", SIG: "signature.png", LOGO_R: "logo-right.jpg" };
const out = path.join(__dirname, "..", "public", "images");
fs.mkdirSync(out, { recursive: true });
for (const [name, file] of Object.entries(map)) {
  const m = html.match(new RegExp("const " + name + '="data:image/[a-z]+;base64,([^"]+)"'));
  if (!m) { console.log("Not found:", name); continue; }
  fs.writeFileSync(path.join(out, file), Buffer.from(m[1], "base64"));
  console.log("Saved", file);
}
