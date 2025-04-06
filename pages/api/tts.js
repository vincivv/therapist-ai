// pages/api/tts.js
export default async function handler(req, res) {
    const { text } = req.body;
  
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
  
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1', 
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.75
          }
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs Error:', errorText);
        return res.status(500).json({ error: 'Failed to generate voice' });
      }
  
      const buffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
  
      res.status(200).json({ audioUrl });
    } catch (err) {
      console.error('TTS API Error:', err);
      res.status(500).json({ error: 'Server error during voice synthesis' });
    }
  }
  