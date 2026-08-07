import { AiProvider, AiTask, ListingType } from "@prisma/client";
import { z } from "zod";

const locale = z.string().trim().regex(/^[a-z]{2}(?:-[A-Z]{2})?$/).max(12).default("tr");
const id = z.string().uuid();

export const propertySearchInputSchema = z.object({ query: z.string().trim().min(5).max(1_000), locale });
export const propertySearchOutputSchema = z.object({ city: z.string().max(80).nullable().optional(), district: z.string().max(80).nullable().optional(), neighborhood: z.string().max(80).nullable().optional(), listingType: z.nativeEnum(ListingType).nullable().optional(), bedrooms: z.coerce.number().int().min(0).max(30).nullable().optional(), minPrice: z.coerce.number().nonnegative().nullable().optional(), maxPrice: z.coerce.number().nonnegative().nullable().optional(), minArea: z.coerce.number().nonnegative().nullable().optional(), q: z.string().max(100).nullable().optional() });

export const listingGeneratorInputSchema = z.object({ propertyId: id.optional(), property: z.record(z.string(), z.unknown()).optional(), locale, tone: z.enum(["luxury", "warm", "investment", "concise"]).default("luxury") }).refine((value) => value.propertyId || value.property, "propertyId or property is required.");
export const listingGeneratorOutputSchema = z.object({ description: z.string().min(1).max(20_000), seoTitle: z.string().min(1).max(180), seoDescription: z.string().min(1).max(500), instagramCaption: z.string().min(1).max(4_000), facebookCaption: z.string().min(1).max(6_000), linkedinPost: z.string().min(1).max(6_000), googleBusinessPost: z.string().min(1).max(1_500) });

export const translationInputSchema = z.object({ propertyId: id.optional(), sourceLocale: locale, targetLocales: z.array(locale).min(1).max(20), content: z.record(z.string(), z.string().max(20_000)).refine((value) => Object.keys(value).length > 0, "At least one field is required.") });
export const translationOutputSchema = z.object({ translation: z.string().min(1).max(20_000) });

export const chatInputSchema = z.object({ conversationId: id.optional(), message: z.string().trim().min(1).max(2_000), locale });
export const chatOutputSchema = z.object({ answer: z.string().min(1).max(8_000), recommendedPropertyIds: z.array(z.string().uuid()).max(3).default([]) });

export const adminAssistantInputSchema = z.object({ analysis: z.enum(["report", "market_trends", "agent_comparison", "property_performance"]), question: z.string().trim().min(3).max(2_000), locale });
export const crmAssistantInputSchema = z.object({ customerId: id, action: z.enum(["summary", "follow_up"]), locale });
export const crmAssistantOutputSchema = z.object({ summary: z.string().min(1).max(8_000), suggestedFollowUps: z.array(z.string().min(1).max(1_000)).max(5), risks: z.array(z.string().min(1).max(1_000)).max(5) });

export const providerConfigurationInputSchema = z.object({ provider: z.nativeEnum(AiProvider), displayName: z.string().trim().min(2).max(100), isEnabled: z.boolean().default(false), priority: z.coerce.number().int().min(0).max(10_000).default(100), baseUrl: z.string().url().max(2_048).nullable().optional(), defaultModel: z.string().trim().min(1).max(200), apiKey: z.string().trim().min(8).max(10_000).optional(), additionalConfig: z.record(z.string(), z.unknown()).optional(), timeoutMs: z.coerce.number().int().min(1_000).max(120_000).default(20_000), maxOutputTokens: z.coerce.number().int().min(64).max(8_192).default(2_048), dailyRequestLimit: z.coerce.number().int().min(1).max(10_000_000).nullable().optional(), dailyTokenLimit: z.coerce.number().int().min(1_000).max(1_000_000_000).nullable().optional() });
export const promptTemplateInputSchema = z.object({ task: z.nativeEnum(AiTask), locale, name: z.string().trim().min(2).max(180), version: z.coerce.number().int().min(1).max(10_000).optional(), template: z.string().trim().min(20).max(50_000), variables: z.array(z.string().trim().regex(/^[a-zA-Z][a-zA-Z0-9_]*$/)).max(50), outputSchema: z.record(z.string(), z.unknown()).optional().nullable(), isActive: z.boolean().default(true) });
