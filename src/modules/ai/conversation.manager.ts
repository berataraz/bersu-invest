import { AiConversationStatus, AiMessageRole, AiTask, Prisma, type AiProvider } from "@prisma/client";
import { ApiError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { type AiMessage } from "@/modules/ai/ai.types";

export async function resolveConversation(input: { conversationId?: string; task: AiTask; locale: string; userId?: string | null; customerId?: string | null; title?: string }) {
  if (input.conversationId) {
    const conversation = await prisma.aiConversation.findFirst({ where: { id: input.conversationId, task: input.task, status: AiConversationStatus.ACTIVE, deletedAt: null } });
    if (!conversation) throw new ApiError(404, "Conversation not found.", "AI_CONVERSATION_NOT_FOUND");
    if (conversation.userId && conversation.userId !== input.userId) throw new ApiError(403, "Conversation access is not allowed.", "AI_CONVERSATION_FORBIDDEN");
    return conversation;
  }
  return prisma.aiConversation.create({ data: { task: input.task, locale: input.locale, userId: input.userId ?? null, customerId: input.customerId ?? null, title: input.title } });
}

export async function getConversationMessages(conversationId: string, limit = 16): Promise<AiMessage[]> {
  const messages = await prisma.aiConversationMessage.findMany({ where: { conversationId }, orderBy: { createdAt: "desc" }, take: limit });
  return messages.reverse().map((message) => ({ role: message.role.toLowerCase() as AiMessage["role"], content: message.content }));
}

export async function appendConversationMessage(input: { conversationId: string; role: AiMessageRole; content: string; provider?: AiProvider; model?: string; promptTemplateId?: string | null; metadata?: Record<string, Prisma.InputJsonValue> }) {
  await prisma.$transaction([
    prisma.aiConversationMessage.create({ data: { ...input, promptTemplateId: input.promptTemplateId ?? null, metadata: input.metadata as Prisma.InputJsonValue | undefined } }),
    prisma.aiConversation.update({ where: { id: input.conversationId }, data: { lastMessageAt: new Date() } }),
  ]);
}
