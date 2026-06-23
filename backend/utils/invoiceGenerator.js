import Counter from "../models/Counter.js";

export const generateInvoiceNumber = async () => {
  try {

    const counter = await Counter.findOneAndUpdate(
      { name: "invoice" },
      { $inc: { sequence: 1 } },
      {
        new: true,
        upsert: true
      }
    );

    const today = new Date();

    const datePart = 
    today.getFullYear().toString() +
    String(today.getMonth() + 1).padStart(2, "0") +
    String(today.getDate()).padStart(2, "0");

    const sequencePart = String(counter.sequence).padStart(6, "0");

    return `INV-${datePart}-${sequencePart}`;

  } catch (error) {
    console.error("Error generate invoice number:", error);
  }
}