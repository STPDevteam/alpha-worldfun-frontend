export type BaseFormDataType = {
  type?: "world-idea" | "world-agent" | "utility-agent";
  fundraisingType?: "fixed-price" | "bonding-curve";
  name: string;
  symbol: string;
  description: string;
  endDate?: Date;
  image: {
    data: string;
    metadata: {
      size: number;
      name: string;
    };
  };
  bannerUrl: string | null;
};

export type WorldIdeaFormDataType = {
  worldXHandler?: string;
  onchainProfileLink?: string;
  targetFundraise?: number;
};

export type BondingCurveFormDataType = {
  xUrl?: string;
  telegramUrl?: string;
  discordUrl?: string;
  gitHubUrl?: string;
  websiteUrl?: string;
};

export type WorldAgentFormDataType = {
  agentId?: string;
  agentName?: string;
  agentImgUrl?: string;
  agentDescription?: string;
  taskDescription?: string;
};

export type FormDataType = BaseFormDataType &
  WorldIdeaFormDataType &
  BondingCurveFormDataType &
  WorldAgentFormDataType;
