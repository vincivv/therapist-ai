export default async function handler(req, res) {
    try {
      const { messages } = req.body;
  
      console.log("📨 Incoming voice message payload:", messages);
  
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        console.warn("⚠️ No messages provided");
        return res.status(400).json({ response: "No messages provided." });
      }
  
      const formattedMessages = [
        {
          role: "user",
          parts: [
            {
              text: `You are a warm and supportive mental wellness coach.
                    Respond kindly and supportively based on this mood.
                    Speak in a calm, respectful, and friendly tone.
                    Only reflect emotions the user clearly expresses.
                    Do not make assumptions. Do not provide clinical advice.
                    Avoid repeating phrases or restarting the conversation.
                    Encourage open, natural dialogue and support gently.
                    Sometimes make jokes that can make the user feel good if they are not in a good mood.`,
            }
          ]
        },
        ...messages.map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        }))
      ];
  
      console.log("📤 Sending to Gemini:", JSON.stringify(formattedMessages, null, 2));
  
      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: formattedMessages })
        }
      );
  
      const data = await result.json();
      console.log("🤖 Gemini raw response:", JSON.stringify(data, null, 2));
  
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (!reply) {
        console.warn("⚠️ No reply text found in Gemini response");
      }
  
      res.status(200).json({
        response: reply || "Hmm, I'm here and listening. Can you tell me more?"
      });
  
    } catch (error) {
      console.error("❌ Gemini API error:", error);
      res.status(500).json({ response: "Oops! Something went wrong. Try again soon." });
    }
  }
  