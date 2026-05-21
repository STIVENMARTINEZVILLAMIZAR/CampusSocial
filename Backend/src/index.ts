import { initializeApp } from "firebase-admin/app";

initializeApp();

export { generateContent } from "./ai/generateContent";
export { chatWithAgent } from "./ai/chatWithAgent";
export { schedulePost } from "./posts/schedulePost";
export { publishPostNow } from "./posts/publishPostCallable";
export { scheduledPublisher } from "./posts/scheduledPublisher";
export { triggerN8nWorkflow } from "./integracion/triggerN8nWorkflow";
export { onAuthUserCreate } from "./auth/onUserCreate";
export { healthCheck } from "./ai/healthCheck";
