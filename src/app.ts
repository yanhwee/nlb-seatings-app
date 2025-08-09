import { getLibraryInfo } from "./service.js";

async function main() {
    const data = await getLibraryInfo();
    console.log(data);
}

main();
