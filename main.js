const { parse, stringify } = require('@node-steam/vdf');
const sharp = require('sharp');
const fs = require('fs');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function HashBufferToInt64(buffer) {
    const hash = crypto.createHash('sha256').update(buffer).digest();
    const high = BigInt(hash.readUInt32BE(0));
    const low = BigInt(hash.readUInt32BE(4));
    return (high << 32n) | low;
}


function GetFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}_1.jpg`;
}

const APPID = 570; // dota2

// 760 seems like steam screenshot manager appid? XD
const path = "G:\\Steam\\userdata\\452282117\\760\\";
const gamefolder = `${path}remote\\${APPID}\\screenshots\\`;

const vdfpath = path + "screenshots.vdf";

const filename = GetFileName();
const filepath = gamefolder + filename;
const thumbnail_filepath = gamefolder + "\\thumbnails\\" + filename;

const vdf = parse(fs.readFileSync(vdfpath).toString());

const ssinfo = {
    type: 1,
    filename: `${APPID}/screenshots/${filename}`,
    thumbnail: `${APPID}/screenshots/thumbnails/${filename}`,
    vrfilename: "",
    imported: 1,
    width: 0,
    height: 0,
    gameid: APPID, // ???
    creation: Math.floor(Date.now() / 1000),
    caption: "",
    Permissions: 2, // private??
    hscreenshot: 0x1999999999999999,
    publishedfileid: 0
}

let insert_pos = 0;
while(vdf.screenshots[APPID][insert_pos])
{
    insert_pos++;
}

console.log("Better quit the steam before you import.");
rl.question('Where is your file located to import? (Drag file here)\n', async (answer) => {
    if(!fs.existsSync(answer))
    {
        console.log("the file does not exist.");
        return;
    }

    fs.copyFileSync(answer, filepath);
    fs.copyFileSync(answer, thumbnail_filepath);

    ssinfo.hscreenshot = HashBufferToInt64(fs.readFileSync(filepath));

    const meta = await sharp(filepath).metadata();

    ssinfo.width = meta.width;
    ssinfo.height = meta.height;

    vdf.screenshots[APPID][insert_pos] = ssinfo;

    const strvdf = stringify(vdf);

    fs.writeFileSync(vdfpath, strvdf);

    console.log("You need restart steam to take effects.");
    rl.close();
});



