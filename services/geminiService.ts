import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

// Initialize Gemini Client directly as per strict guidelines
// "The API key must be obtained exclusively from the environment variable process.env.API_KEY"
// "Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});"
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeTasks = async (tasks: Task[]): Promise<string> => {
  try {
    const tasksJson = JSON.stringify(tasks.map(t => ({
      title: t.title,
      due: t.dueDate,
      priority: t.priority,
      status: t.status
    })));

    const prompt = `
      بصفتك مساعدًا ذكيًا للإنتاجية، قم بتحليل قائمة المهام التالية لموظف محترف.
      المهام: ${tasksJson}
      
      المطلوب:
      1. قدم ملخصاً موجزاً لحالة العمل اليوم.
      2. اقترح المهام التي يجب التركيز عليها أولاً بناءً على الأولويات والمواعيد النهائية.
      3. قدم نصيحة واحدة لزيادة الإنتاجية.
      
      الرجاء الرد باللغة العربية بأسلوب احترافي ومشجع. استخدم تنسيق Markdown للعناوين والنقاط.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful, professional productivity assistant tailored for an Arabic corporate environment. Always respond in Arabic.",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    return response.text || "لم يتمكن المساعد الذكي من تحليل البيانات حالياً.";
  } catch (error) {
    console.error("Error analyzing tasks:", error);
    return "حدث خطأ أثناء الاتصال بالمساعد الذكي. يرجى المحاولة لاحقاً.";
  }
};