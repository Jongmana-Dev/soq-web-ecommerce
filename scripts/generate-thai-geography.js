/**
 * Generate comprehensive Thailand geography data JSON file
 *
 * Source: earthchie/jquery.Thailand.js raw database
 * Output: public/data/thai-geography.json
 *
 * Structure:
 * [
 *   {
 *     "province": "กรุงเทพมหานคร",
 *     "districts": [
 *       {
 *         "district": "พระนคร",
 *         "subdistricts": [
 *           { "subdistrict": "พระบรมมหาราชวัง", "zipcode": "10200" }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 */

const fs = require("fs");
const path = require("path");

const RAW_DATA_PATH = "/tmp/thai-raw-db.json";
const OUTPUT_PATH = path.join(
  __dirname,
  "..",
  "public",
  "data",
  "thai-geography.json"
);

function generateThaiGeography() {
  // Read raw data
  if (!fs.existsSync(RAW_DATA_PATH)) {
    console.error(`Raw data not found at ${RAW_DATA_PATH}`);
    console.error(
      "Please download from: https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json"
    );
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(RAW_DATA_PATH, "utf-8"));
  console.log(`Loaded ${rawData.length} raw records`);

  // Build hierarchical structure using a Map for grouping
  const provinceMap = new Map();

  for (const record of rawData) {
    const provinceName = record.province;
    const districtName = record.amphoe;
    const subdistrictName = record.district;
    const zipcode = String(record.zipcode).padStart(5, "0");

    // Get or create province
    if (!provinceMap.has(provinceName)) {
      provinceMap.set(provinceName, new Map());
    }
    const districtMap = provinceMap.get(provinceName);

    // Get or create district
    if (!districtMap.has(districtName)) {
      districtMap.set(districtName, []);
    }
    const subdistricts = districtMap.get(districtName);

    // Add subdistrict
    subdistricts.push({
      subdistrict: subdistrictName,
      zipcode: zipcode,
    });
  }

  // Convert to array structure, sorted alphabetically by Thai province name
  const result = [];

  // Sort provinces alphabetically in Thai
  const sortedProvinces = [...provinceMap.keys()].sort((a, b) =>
    a.localeCompare(b, "th")
  );

  for (const provinceName of sortedProvinces) {
    const districtMap = provinceMap.get(provinceName);

    // Sort districts alphabetically in Thai
    const sortedDistricts = [...districtMap.keys()].sort((a, b) =>
      a.localeCompare(b, "th")
    );

    const districts = [];
    for (const districtName of sortedDistricts) {
      const subdistricts = districtMap.get(districtName);

      // Sort subdistricts alphabetically in Thai
      subdistricts.sort((a, b) =>
        a.subdistrict.localeCompare(b.subdistrict, "th")
      );

      districts.push({
        district: districtName,
        subdistricts: subdistricts,
      });
    }

    result.push({
      province: provinceName,
      districts: districts,
    });
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");

  // Verification
  console.log("\n=== Verification ===");
  console.log(`Output file: ${OUTPUT_PATH}`);
  console.log(`File size: ${(fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Provinces: ${result.length}`);

  let totalDistricts = 0;
  let totalSubdistricts = 0;
  for (const province of result) {
    totalDistricts += province.districts.length;
    for (const district of province.districts) {
      totalSubdistricts += district.subdistricts.length;
    }
  }
  console.log(`Total districts: ${totalDistricts}`);
  console.log(`Total subdistricts: ${totalSubdistricts}`);

  // Spot checks
  console.log("\n=== Spot Checks ===");

  // Check Bangkok
  const bangkok = result.find((p) => p.province === "กรุงเทพมหานคร");
  if (bangkok) {
    console.log(
      `Bangkok (กรุงเทพมหานคร): ${bangkok.districts.length} districts`
    );
    const phraNakhon = bangkok.districts.find(
      (d) => d.district === "พระนคร"
    );
    if (phraNakhon) {
      console.log(
        `  พระนคร: ${phraNakhon.subdistricts.length} subdistricts`
      );
      const palace = phraNakhon.subdistricts.find(
        (s) => s.subdistrict === "พระบรมมหาราชวัง"
      );
      if (palace) {
        console.log(
          `  พระบรมมหาราชวัง zipcode: ${palace.zipcode} (expected: 10200)`
        );
        console.log(
          `  ${palace.zipcode === "10200" ? "PASS" : "FAIL"}`
        );
      } else {
        console.log("  FAIL: พระบรมมหาราชวัง not found");
      }
    } else {
      console.log("  FAIL: พระนคร not found");
    }
  } else {
    console.log("FAIL: กรุงเทพมหานคร not found");
  }

  // Check Chiang Mai
  const chiangMai = result.find((p) => p.province === "เชียงใหม่");
  if (chiangMai) {
    console.log(
      `\nChiang Mai (เชียงใหม่): ${chiangMai.districts.length} districts`
    );
    const muang = chiangMai.districts.find(
      (d) => d.district === "เมืองเชียงใหม่"
    );
    if (muang) {
      console.log(
        `  เมืองเชียงใหม่: ${muang.subdistricts.length} subdistricts`
      );
    }
  }

  // Check Nakhon Ratchasima
  const nakhon = result.find((p) => p.province === "นครราชสีมา");
  if (nakhon) {
    console.log(
      `\nNakhon Ratchasima (นครราชสีมา): ${nakhon.districts.length} districts`
    );
  }

  // Check first and last provinces
  console.log(`\nFirst province: ${result[0].province}`);
  console.log(`Last province: ${result[result.length - 1].province}`);

  // Count validation
  console.log("\n=== Count Validation ===");
  console.log(
    `Provinces: ${result.length} ${result.length === 77 ? "PASS" : "FAIL (expected 77)"}`
  );
  console.log(
    `Districts: ${totalDistricts} ${totalDistricts >= 900 ? "PASS" : "FAIL (expected ~928)"}`
  );
  console.log(
    `Subdistricts: ${totalSubdistricts} ${totalSubdistricts >= 7400 ? "PASS" : "FAIL (expected ~7400+)"}`
  );

  console.log("\nDone!");
}

generateThaiGeography();
