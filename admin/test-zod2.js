const { z } = require("zod");
const schema = z.object({
  price: z.number().min(0, "oops"),
  dur: z.number().min(0, "oops")
});

try { schema.parse({ price: NaN, dur: NaN }); } catch(e) { console.log("NaN:", e.issues[0].message); }
try { schema.parse({ price: "10", dur: "10" }); } catch(e) { console.log("String:", e.issues[0].message); }

