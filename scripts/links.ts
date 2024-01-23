/*
This script loads links from a Google Sheet and saves them to this codebase.

It expects the SHEET_ID and GOOGLE_API_KEY environment variables to be set.
 */

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

// Directory for saving images
const dir = path.join(
    new URL("..", import.meta.url).toString().slice(5),
    "src",
    "links",
);
// Path to the JSON data to be saved
const dataPath = path.join(
    new URL("..", import.meta.url).toString().slice(5),
    "src",
    "data.json",
);

if (!process.env.SHEET_ID || !process.env.GOOGLE_API_KEY) {
    throw new Error(
        "The SHEET_ID and GOOGLE_API_KEY environment variables must be set.",
    );
}

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, {
    apiKey: process.env.GOOGLE_API_KEY,
});

// Used for cropping to a circle shape
const circle = Buffer.from('<svg><circle r="64" cx="64" cy="64"/></svg>');

(async () => {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const items = rows.map((it) => it.toObject()) as ProcessLink[];

    let data: Category[] = [];
    for (let it of items) {
        let logo: string = "";
        if (it.logo) {
            // The images are cached based on a hash.
            let logoHash = hash(it.logo, it.process);
            let imgName =
                convertName(it.name) +
                "-" +
                logoHash;
            let imgPath = path.join(dir, imgName);
            let exists = await glob(imgPath + ".*");

            // If the image already exists, just use that.
            if (exists.length > 0) {
                logo = path.basename(exists[0]);
            } else {
                logo = await processLogo(imgPath, imgName, it.logo, it.process);
            }
        }
        it.logo = logo;
        let cat = data.find((c) => c.title === it.category);
        if (!cat) {
            cat = {
                title: it.category,
                icon: convertName(it.category),
                links: [],
            };
            data.push(cat);
        }

        cat.links.push(it);
    }

    await fs.writeFile(dataPath, JSON.stringify(data));
})().catch(console.error);

function hash(logo: string, process?: ProcessLink["process"]) {
    return createHash("md5")
        .update(logo + process)
        .digest("hex");
}

function convertName(name: string) {
    return kebabCase(name.replaceAll(/[^a-zA-Z0-9 -]/g, ""))
}

async function processLogo(imgPath: string, imgName: string, logo: string, process?: ProcessLink["process"]) {
    let img: sharp.Sharp;
    // Support for data URI images
    if (logo.startsWith("data:image")) {
        let buf = Buffer.from(
            logo.split("base64,").pop(),
            "base64",
        );
        img = sharp(buf);
    } else if (logo.startsWith("http")) {
        let buf = await (await fetch(logo)).arrayBuffer();
        img = sharp(buf);
    }

    const meta = await img.metadata();
    // Default to the same format, but it may get changed if transparency needs to be added.
    let ext = meta.format;

    let out: sharp.Sharp;
    if (process === "crop") {
        out = img
            .resize({
                fit: "inside",
                width: 128,
                height: 128,
            })
            .composite([
                {
                    input: circle,
                    blend: "dest-in",
                },
            ]);
        ext = "png";
    } else if (process === "extend") {
        // Extend makes the background a bit bigger for better cropping to a circle
        let extend = Math.floor(meta.width * 0.1);
        out = img.extend({
            extendWith: "background",
            top: extend,
            right: extend,
            bottom: extend,
            left: extend,
        });

        out = sharp(await out.toBuffer());
        out.resize({
            fit: "inside",
            width: 128,
            height: 128,
        }).composite([
            {
                input: circle,
                blend: "dest-in",
            },
        ]);
        ext = "png";
    } else {
        out = img.resize({
            fit: "inside",
            width: 128,
            height: 128,
        });
    }

    await out.toFile(imgPath + "." + ext);
    return imgName + "." + ext;
}
