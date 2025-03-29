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

        if (!stake_name || stake_name === "All Stakes") {
            stake_name = "";
        }

        const age_distribution_result = await query("CALL age_distribution(?, ?)", [participant_type, stake_name]);
        const gender_distribution_result = await query("CALL gender_distribution(?, ?)", [participant_type, stake_name]);
        const registration_status_breakdown_result = await query("CALL registration_status_breakdown(?,?)", [participant_type, stake_name]);
        const shirt_size_distribution_result = await query("CALL shirt_size_distribution(?, ?)", [participant_type, stake_name]);
        const weekly_registration_growth = await query("CALL weekly_registration_growth(?, ?)", [participant_type, stake_name]);
        const stake_participants_result = await query("CALL stake_participation(?)", [participant_type]);
        const unit_participants_result = await query("CALL stake_unit_participation(?, ?)", [participant_type, stake_name]);
        const medical_information_result = await query("CALL medical_information(?, ?)", [participant_type, stake_name]);
        const dietary_information_result = await query("CALL dietary_information(?, ?)", [participant_type, stake_name]);

        res.status(200).json({
            age_distribution: age_distribution_result[0],
            gender_distribution: gender_distribution_result[0],
            registration_status_breakdown: registration_status_breakdown_result[0],
            shirt_size_distribution: shirt_size_distribution_result[0],
            weekly_registration_growth: weekly_registration_growth[0],
            stake_participants: stake_participants_result[0],
            unit_participants: unit_participants_result[0],
            medical_information: medical_information_result[0],
            dietary_information: dietary_information_result[0]
        });

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
}
