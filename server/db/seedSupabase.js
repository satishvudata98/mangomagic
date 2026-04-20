require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const { now, supabaseRequest } = require("./supabase");
const { products, serviceablePincodes } = require("./seedData");

async function seed() {
  const timestamp = now();
  const productsPayload = products.map((product) => ({
    ...product,
    updated_at: timestamp
  }));
  const pincodesPayload = serviceablePincodes.map((item) => ({
    ...item,
    updated_at: timestamp
  }));

  await supabaseRequest("products", {
    method: "POST",
    query: {
      on_conflict: "id"
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: productsPayload
  });

  await supabaseRequest("serviceable_pincodes", {
    method: "POST",
    query: {
      on_conflict: "pincode"
    },
    headers: {
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: pincodesPayload
  });

  console.log("Supabase seed completed successfully.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
