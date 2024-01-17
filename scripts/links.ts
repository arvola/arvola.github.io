import 'dotenv/config'
import { GoogleSpreadsheet } from "google-spreadsheet";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as sharp from "sharp";
import {createHash} from "node:crypto";
import {Link} from "../src/data";

const dir = path.join(__dirname, "..", "public", "links");

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, {
    apiKey: process.env.GOOGLE_API_KEY,
});

(async () => {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();
    const items = rows.map((it) => it.toObject());

    let data: Record<string, Link> = {};
    for (let it of items) {
        let logoHash = createHash("md5").update(it.logo).digest("hex");
        let stat = await fs.stat(path.join(dir, logoHash));
        
    }

})().catch(console.error);

async function loadLogo(link: Link) {

}
