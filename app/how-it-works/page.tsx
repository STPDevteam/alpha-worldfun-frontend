import React from "react";
import { Metadata } from "next";
import HowItWorksPageContent from "./layout";

export const metadata: Metadata = {
  title: "World.fun Alpha",
  description:
    "Learn how World.fun Alpha works - from discovering autonomous worlds to participating in AI-native experiences and contributing to world launches.",
};

const HowItWorksPage = () => {
  return <HowItWorksPageContent />;
};

export default HowItWorksPage;
