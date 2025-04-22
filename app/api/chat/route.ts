
import { NextResponse } from "next/server";
import  { GoogleGenerativeAI } from '@google/generative-ai'
import removeMarkdown from 'remove-markdown';
// Initialize the Google Generative AI with your API key
const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "YOUR_API_KEY");

export async function POST(request:Request) {
  try {
    // Parse the request body to get the messages
		type Message = {
			role: "user" | "assistant" | "model";
			content: string;
		};
    const { messages } = await request.json();

    // Set up streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Get the Gemini model
          const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-preview-04-17" });

          // Format conversation history for Gemini
          const formattedMessages = messages.map((msg:Message) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          }));

          // Extract the latest user message

          // For Gemini, we need to use a different approach for system instructions
          // Add the system instructions as a preamble to the conversation
          const systemInstructions = {
            role: "model",
            parts: [{
              text: `System Prompt for smartERP Bot

You are smartERP Bot, the official AI assistant for smartERP—an educational technology platform designed to transform school management.​

Your Purpose:

Provide accurate, helpful, and concise information exclusively about smartERP's features, services, and educational technology solutions.​

Key Features of smartERP:

Student Management: Streamline enrollment, attendance tracking, and academic progress monitoring.

Course Administration: Create and manage courses, assign teachers, and track curriculum progress.

Attendance Tracking: Monitor student and staff attendance in real-time with automated reporting and notifications.

Performance Analytics: Gain insights into student performance with comprehensive analytics and customizable reports.

Communication Tools: Facilitate communication between administrators, teachers, students, and parents through integrated messaging and announcements.

Mobile Support: Access the platform anytime, anywhere with mobile compatibility.​

Guidelines for Interaction:

If a user inquires about topics unrelated to smartERP or educational technology, politely redirect them:

"I'm here to assist with smartERP educational platform questions. How can I help you with your school management needs?"​

Always steer conversations back to how smartERP can benefit educational institutions.​

Tone and Style:

Be friendly, professional, and informative.

Use clear and concise language.

Focus on how smartERP's features can solve specific problems in school management.​

Contact Information:

Email: Hello@smartERP.ai

Location: Bhopal, India​

`
            }]
          };

          // Create chat with the system message first
          const chatHistory = [systemInstructions, ...formattedMessages];

          // Generate content using the complete prompt
          const result = await model.generateContent({
            contents: chatHistory,
          });

          const response = result.response.text();
					const cleanResponse = removeMarkdown(response);

          // Send the response through the stream
          controller.enqueue(encoder.encode(cleanResponse));
          controller.close();
        } catch (error) {
          console.error("Error generating response:", error);
          controller.enqueue(encoder.encode("Sorry, I encountered an error processing your request."));
          controller.close();
        }
      }
    });

    // Return the stream as a response
    return new Response(stream);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
