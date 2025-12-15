import { z } from "zod";

export const formTypeSchema = z.object({
  type: z.enum(["world-idea", "world-agent", "utility-agent"]),
});
export const formFundraisingTypeSchema = z.object({
  fundraisingType: z.enum(["fixed-price", "bonding-curve"]),
});
export const formSubmitWorldSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(30, { message: "Name must be equal or less than 30 characters" }),
  symbol: z
    .string()
    .min(1, { message: "Symbol is required" })
    .max(10, { message: "Symbol must be equal or less than 10 characters" }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(300, {
      message: "Description must be equal or less than 300 characters",
    }),
  image: z.string().min(1, { message: "Image is required" }),
  bannerUrl: z.string().optional().nullable(),
  worldXHandler: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/.test(
          value
        ),
      {
        message: "Please provide a valid URL",
      }
    ),
  onchainProfileLink: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/.test(
          value
        ),
      {
        message: "Please provide a valid URL",
      }
    ),
  xUrl: z
    .string()
    .refine(
      (value) =>
        !value || /^(https?:\/\/)?(x\.com)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "X URL must be a valid X URL",
      }
    )
    .optional(),
  discordUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(discord\.gg|discord\.com|discordapp\.com)\/[A-Za-z0-9_-]+\/?$/i.test(
          value
        ),
      {
        message: "Discord URL must be a valid Discord URL",
      }
    )
    .optional(),
  telegramUrl: z
    .string()
    .refine(
      (value) =>
        !value || /^(https?:\/\/)?(t\.me)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "Telegram URL must be a valid Telegram URL",
      }
    )
    .optional(),
  gitHubUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(github\.com)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "GitHub URL must be a valid GitHub URL",
      }
    )
    .optional(),
  websiteUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/.test(
          value
        ),
      {
        message: "Website URL must be a valid URL",
      }
    )
    .optional(),
});

export const formCreateAgentSchema = z.object({
  agentName: z.string().min(1, { message: "Agent name is required" }).max(30, {
    message: "Agent name must be equal or less than 30 characters",
  }),
  agentDescription: z
    .string()
    .min(1, { message: "Agent description is required" })
    .max(300, {
      message: "Agent description must be equal or less than 300 characters",
    }),
  taskDescription: z
    .string()
    .min(1, { message: "Task description is required" })
    .max(300, {
      message: "Task description must be equal or less than 300 characters",
    }),
  symbol: z
    .string()
    .min(1, { message: "Symbol is required" })
    .max(10, { message: "Symbol must be equal or less than 10 characters" }),
  image: z.string().min(1, { message: "Image is required" }),
  bannerUrl: z.string().optional().nullable(),
  xUrl: z
    .string()
    .refine(
      (value) =>
        !value || /^(https?:\/\/)?(x\.com)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "X URL must be a valid X URL",
      }
    )
    .optional(),
  discordUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(discord\.gg|discord\.com|discordapp\.com)\/[A-Za-z0-9_-]+\/?$/i.test(
          value
        ),
      {
        message: "Discord URL must be a valid Discord URL",
      }
    )
    .optional(),
  telegramUrl: z
    .string()
    .refine(
      (value) =>
        !value || /^(https?:\/\/)?(t\.me)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "Telegram URL must be a valid Telegram URL",
      }
    )
    .optional(),
  gitHubUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?(github\.com)\/[A-Za-z0-9_-]+\/?$/i.test(value),
      {
        message: "GitHub URL must be a valid GitHub URL",
      }
    )
    .optional(),
  websiteUrl: z
    .string()
    .refine(
      (value) =>
        !value ||
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/[\w.-]*)*\/?$/.test(
          value
        ),
      {
        message: "Website URL must be a valid URL",
      }
    )
    .optional(),
});

export const formWorldAgentSchema = z.object({
  agentName: z.string().min(1, { message: "Agent is required" }),
});
