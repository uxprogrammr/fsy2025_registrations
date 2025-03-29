import { query } from "@/lib/db";

export default async function handler(req, res) {
    try {

        let { participant_type, stake_name } = req.query;

        if (!participant_type) {
            return res.status(400).json({ error: "Missing participant type parameter" });
        }

        if (participant_type !== "Participant" && participant_type !== "Counselor") {
            return res.status(400).json({ error: "Invalid participant type parameter" });
        }

        if (!stake_name) {
            stake_name = "";
        }

        const results = await query("CALL dietary_information(?,?)", [participant_type, stake_name]);

        res.status(200).json({ "data": results[0] });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
}
