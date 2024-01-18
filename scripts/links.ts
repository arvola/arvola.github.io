import 'dotenv/config'
import { GoogleSpreadsheet } from "google-spreadsheet";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import sharp from "sharp";
import {createHash} from "node:crypto";
import {Link} from "../src/data";
import { kebabCase } from "change-case";
import { glob } from "glob";

const dir = path.join(new URL("..", import.meta.url).toString().slice(5),  "public", "links");

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, {
    apiKey: process.env.GOOGLE_API_KEY,
});

(async () => {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const items = rows.map((it) => it.toObject()) as Link[];

    console.log(items);

    let data: Record<string, Link> = {};
    for (let it of items) {
        let logo: string = "";
        if (it.logo) {
            let logoHash = createHash("md5").update(it.logo).digest("hex");
            let imgName = kebabCase(it.name.replaceAll(/[^a-zA-Z0-9-]/g, "")) + "-" + logoHash;
            let imgPath = path.join(dir, imgName);
            let exists = await glob(imgPath + ".*");
            if (exists.length > 0) {
                logo = "/links/" + path.basename(exists[0]);
            } else {
                let img: sharp.Sharp;
                if (it.logo.startsWith("data:image")) {
                    let buf = Buffer.from(it.logo.split("base64,").pop(), "base64");
                    img = sharp(buf);
                } else if (it.logo.startsWith("http")) {
                    let buf = await (await fetch(it.logo)).arrayBuffer();
                    img = sharp(buf);
                }

                const meta = await img.metadata();
                const ext = meta.format;
                imgPath += "." + ext;

                await img.resize({fit: "inside", width: 256, height: 256})
                    .toFile(imgPath);

                logo = "/links/" + imgName + "." + ext;
            }
        }
        console.log(logo);
    }

})().catch(console.error);

async function loadLogo(link: Link) {

}
