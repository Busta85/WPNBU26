import express from "express";
import { GoogleGenAI } from "@google/genai";

const app = express();

// Use JSON parsing middleware
app.use(express.json());

// API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

const getAppVersion = () => {
  return process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "dev-version";
};

app.get("/api/version", (req, res) => {
  res.json({ version: getAppVersion() });
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt + ", Western Province natural bodybuilding aesthetic, natural muscle, professional stage lighting, high quality",
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "1:1"
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64Image = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        res.json({ imageUrl });
    } else {
        res.status(500).json({ error: "No image found in response" });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// Lazy loaded Twilio client
let twilioClient: any = null;

app.post("/api/send-sms", async (req, res) => {
  try {
    const { to, message } = req.body;
    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' or 'message' in request body" });
    }

    if (!twilioClient) {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (!twilioSid || !twilioToken) {
        console.warn("Twilio credentials not configured. Skipping SMS.");
        return res.status(200).json({ success: true, fake: true, message: "Twilio credentials missing; SMS logging only." });
      }
      
      const twilioModule = (await import('twilio')) as any;
      const twilio = twilioModule.default || twilioModule;
      twilioClient = twilio(twilioSid, twilioToken);
    }

    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    if (!fromPhone) {
       console.warn("Twilio sender phone number not configured.");
       return res.status(200).json({ success: true, fake: true, message: "Sender number missing; SMS logging only." });
    }

    await twilioClient.messages.create({
      body: message,
      from: fromPhone,
      to: to
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error sending SMS:", error);
    res.status(500).json({ error: "Failed to send SMS" });
  }
});

import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

app.post("/api/send-email", async (req, res) => {
  try {
    const { subject, text, to } = req.body;
    
    if (!subject || !text) {
      return res.status(400).json({ error: "Missing 'subject' or 'text' in request body" });
    }

    if (!transporter) {
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASSWORD;
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 587;
      
      if (!user || !pass) {
        console.warn("SMTP credentials not configured. Skipping Email.");
        return res.status(200).json({ success: true, fake: true, message: "SMTP credentials missing; Email logging only." });
      }
      
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
    }

    await transporter.sendMail({
      from: process.env.SMTP_USER || '"WPNBF App" <no-reply@wpnbf.com>',
      to: to || "busta850310@gmail.com",
      subject,
      text,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error sending Email:", error);
    res.status(500).json({ error: "Failed to send Email" });
  }
});

export default app;
