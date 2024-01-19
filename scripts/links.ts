import "dotenv/config";
import { GoogleSpreadsheet } from "google-spreadsheet";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import sharp from "sharp";
import { createHash } from "node:crypto";
import { Category, Link } from "../src/data";
import { kebabCase } from "change-case";
import { glob } from "glob";

interface ProcessLink extends Link {
    process?: "crop" | "extend";
}

const dir = path.join(
    new URL("..", import.meta.url).toString().slice(5),
    "src",
    "links",
);
const dataPath = path.join(
    new URL("..", import.meta.url).toString().slice(5),
    "src",
    "data.json",
);

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, {
    apiKey: process.env.GOOGLE_API_KEY,
});

const circle = Buffer.from('<svg><circle r="128" cx="128" cy="128"/></svg>');

(async () => {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const items = rows.map((it) => it.toObject()) as ProcessLink[];

    console.log(items);

    let data: Category[] = [];
    for (let it of items) {
        let logo: string = "";
        if (it.logo) {
            let logoHash = createHash("md5")
                .update(it.logo + it.process)
                .digest("hex");
            let imgName =
                kebabCase(it.name.replaceAll(/[^a-zA-Z0-9 -]/g, "")) +
                "-" +
                logoHash;
            let imgPath = path.join(dir, imgName);
            let exists = await glob(imgPath + ".*");
            if (exists.length > 0) {
                logo = path.basename(exists[0]);
            } else {
                let img: sharp.Sharp;
                if (it.logo.startsWith("data:image")) {
                    let buf = Buffer.from(
                        it.logo.split("base64,").pop(),
                        "base64",
                    );
                    img = sharp(buf);
                } else if (it.logo.startsWith("http")) {
                    let buf = await (await fetch(it.logo)).arrayBuffer();
                    img = sharp(buf);
                }

                const meta = await img.metadata();
                let ext = meta.format;

                let out: sharp.Sharp;
                if (it.process === "crop") {
                    out = img
                        .resize({
                            fit: "inside",
                            width: 256,
                            height: 256,
                        })
                        .composite([
                            {
                                input: circle,
                                blend: "dest-in",
                            },
                        ]);
                    ext = "png";
                } else if (it.process === "extend") {
                    let extend = Math.floor(meta.width * 0.1);
                    out = img

                        .extend({
                            extendWith: "background",
                            top: extend,
                            right: extend,
                            bottom: extend,
                            left: extend,
                        });

                    out = sharp(await out.toBuffer());
                    out.resize({
                            fit: "inside",
                            width: 256,
                            height: 256,
                        })
                        .composite([
                            {
                                input: circle,
                                blend: "dest-in",
                            },
                        ]);
                    ext = "png";
                }

                imgPath += "." + ext;
                logo = imgName + "." + ext;
                await out.toFile(imgPath);
            }
        }
        it.logo = logo;
        let cat = data.find((c) => c.title === it.category);
        if (!cat) {
            cat = {
                title: it.category,
                icon:
                    kebabCase(it.category.replaceAll(/[^a-zA-Z0-9 -]/g, "")) +
                    ".svg",
                links: [],
            };
            data.push(cat);
        }

        cat.links.push(it);
    }

    await fs.writeFile(dataPath, JSON.stringify(data));
})().catch(console.error);

async function loadLogo(link: Link) {}
