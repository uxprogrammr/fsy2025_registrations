export default async function handler(req, res) {
    if (req.method === "POST") {
        const { phoneNumber, message } = req.body;

        if (!phoneNumber || !message) {
            return res.status(400).json({ error: "Missing phone number or message" });
        }

        try {
            const response = await fetch("https://api.semaphore.co/api/v4/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    apikey: process.env.SEMAPHORE_API_KEY,    // Your Semaphore API key
                    number: phoneNumber,                     // Recipient's phone number
                    message: message,                        // Message to send
                    sendername: process.env.SEMAPHORE_SENDER_NAME  // Registered sender name
                }),
            });

            const result = await response.json();

            if (result.status === "ok") {
                res.status(200).json({ success: true, message: "SMS sent successfully", result });
            } else {
                res.status(500).json({ success: false, error: result.message || "Failed to send SMS" });
            }
        } catch (error) {
            console.error("Error sending SMS:", error);
            res.status(500).json({ success: false, error: "Failed to send SMS" });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
