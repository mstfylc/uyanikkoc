import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const downloads = "C:/Users/musta/Downloads";
const fname = fs
  .readdirSync(downloads)
  .find((n) => n.includes("Mobil") && n.includes("tek") && n.includes("2"));
if (!fname) {
  console.error("Mobile tek dosya not found");
  process.exit(1);
}

const html = fs.readFileSync(path.join(downloads, fname), "utf8");
const manifestMatch = html.match(
  /<script type="__bundler\/manifest">([\s\S]*?)<\/script>/,
);
if (!manifestMatch) {
  console.error("manifest not found");
  process.exit(1);
}

const manifest = JSON.parse(manifestMatch[1]);
const outDir = path.join(
  process.cwd(),
  ".design-import/mobile/extracted",
);
fs.mkdirSync(outDir, { recursive: true });

const index = [];
for (const [uuid, entry] of Object.entries(manifest)) {
  let buf = Buffer.from(entry.data, "base64");
  if (entry.compressed) {
    buf = zlib.gunzipSync(buf);
  }
  const text = buf.toString("utf8");
  let name = uuid;
  if (entry.mime === "text/css") name = `${uuid}.css`;
  else if (entry.mime === "text/javascript") name = `${uuid}.js`;
  else if (entry.mime === "text/html") name = `${uuid}.html`;

  const mobileHint = text.match(/mobile\/([a-z0-9_.-]+)/i)?.[1];
  if (mobileHint) name = mobileHint;

  fs.writeFileSync(path.join(outDir, name), text);
  index.push({
    name,
    mime: entry.mime,
    len: text.length,
    preview: text.slice(0, 100).replace(/\n/g, " "),
  });
}

fs.writeFileSync(path.join(outDir, "_index.json"), JSON.stringify(index, null, 2));

const templateMatch = html.match(
  /<script type="__bundler\/template">([\s\S]*?)<\/script>/,
);
if (templateMatch) {
  const template = JSON.parse(templateMatch[1]);
  fs.writeFileSync(
    path.join(outDir, "_template.json"),
    JSON.stringify(Object.keys(template), null, 2),
  );
  for (const [key, value] of Object.entries(template)) {
    if (typeof value === "string" && value.includes(".uk-m")) {
      fs.writeFileSync(path.join(outDir, "uk-mobile.css"), value);
      console.log("Wrote uk-mobile.css from template key:", key);
    }
  }
}

const renamed = [
  ["e1014d45-2adc-4067-85b9-7f8172a6c922", "uk-screens.jsx"],
  ["18f8087b-7769-4f21-9f1f-4362e6519fae", "uk-screens2.jsx"],
  ["e3bdc14f-9d1c-44e5-93b5-da7cc90a4d0b", "uk-screens3.jsx"],
  ["01114a7e-5c60-4f1c-9f6b-b992743d8c4a", "uk-app.jsx"],
  ["66e466a7-edb3-48f1-b730-984b856f1774", "uk-data.jsx"],
  ["ef0878ba-a564-4dbe-8730-ba1333d68890", "ios-frame.jsx"],
  ["67645b19-af7b-4e13-a7fa-4e4b20bd5fec", "tweaks-panel.jsx"],
];
for (const [from, to] of renamed) {
  const src = path.join(outDir, from);
  const dest = path.join(outDir, "..", "src", to);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

console.log(JSON.stringify(index.filter((e) => e.len > 10000), null, 2));
