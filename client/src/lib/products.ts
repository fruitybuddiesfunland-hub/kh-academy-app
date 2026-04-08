import starterKitImg from "@assets/product-starter-kit.jpg";
import skillsBuilderImg from "@assets/product-skills-builder.jpg";
import smallBusinessImg from "@assets/product-small-business.jpg";
import automationMasteryImg from "@assets/product-automation-mastery.jpg";
import ultimateBundleImg from "@assets/product-ultimate-bundle.jpg";

export type ProductInfo = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  priceNum: number;
  label: string;
  image: string;
  coursePath: string;
  highlights: string[];
  badge?: string;
};

export const PRODUCTS: Record<string, ProductInfo> = {
  "quick-start": {
    id: "quick-start",
    title: "AI Quick Start",
    subtitle: "10 free prompts that change how you work",
    description: "Your free introduction to AI mastery \u2014 10 hand-picked prompts across 7 categories.",
    price: "Free",
    priceNum: 0,
    label: "FREE",
    image: starterKitImg,
    coursePath: "/course/quick-start",
    highlights: ["10 hand-picked prompts", "7 categories", "Copy & paste ready"],
    badge: "FREE",
  },
  "starter-kit": {
    id: "starter-kit",
    title: "AI Starter Kit",
    subtitle: "50 prompts \u00b7 7 categories \u00b7 4 installable tools",
    description:
      "50 essential prompts across 10 categories with ready-to-use templates. Includes 4 installable Claude Skills & Gemini Gems.",
    price: "$29",
    priceNum: 29,
    label: "STARTER KIT",
    image: starterKitImg,
    coursePath: "/course/starter-kit",
    highlights: ["50 battle-tested prompts", "4 installable AI tools", "Claude & Gemini optimized"],
  },
  "skills-builder": {
    id: "skills-builder",
    title: "AI Skills Builder",
    subtitle: "Advanced prompting \u00b7 3 installable tools \u00b7 Templates",
    description:
      "Master advanced prompting, build custom Claude Skills and Gemini Gems, and create reusable templates that save hours every week. Includes 3 installable AI tools.",
    price: "$39",
    priceNum: 39,
    label: "SKILLS BUILDER",
    image: skillsBuilderImg,
    coursePath: "/course/skills-builder",
    highlights: ["Build Claude Skills", "Create Gemini Gems", "3 installable tools included"],
    badge: "POPULAR",
  },
  "small-business": {
    id: "small-business",
    title: "AI for Small Business",
    subtitle: "10 chapters \u00b7 6 AI tools \u00b7 Implementation guides",
    description:
      "Complete business AI system \u2014 from customer service to content marketing. 10 chapters of workflows plus 6 installable Claude Skills & Gemini Gems.",
    price: "$59",
    priceNum: 59,
    label: "SMALL BUSINESS",
    image: smallBusinessImg,
    coursePath: "/course/small-business",
    highlights: ["10 in-depth chapters", "6 installable AI tools", "Implementation templates"],
  },
  "automation-mastery": {
    id: "automation-mastery",
    title: "AI Automation Mastery",
    subtitle: "14 chapters \u00b7 Claude Cowork \u00b7 Hands-free workflows",
    description:
      "Build hands-free AI workflows with Claude Cowork, Zapier, and n8n. 14 chapters covering content, email, CRM, and client onboarding automation. Includes 4 installable automation tools.",
    price: "$79",
    priceNum: 79,
    label: "AUTOMATION",
    image: automationMasteryImg,
    coursePath: "/course/automation-mastery",
    highlights: ["14 chapters", "Claude Cowork + Zapier + n8n", "4 automation tools included"],
    badge: "PREMIUM",
  },
  "ultimate-bundle": {
    id: "ultimate-bundle",
    title: "Ultimate AI Bundle",
    subtitle: "All 4 products \u00b7 Save 40%",
    description:
      "Get every KH Academy product at 40% off. The complete AI mastery path from beginner prompts to full business automation. All 17 installable AI tools included.",
    price: "$119",
    priceNum: 119,
    label: "BUNDLE",
    image: ultimateBundleImg,
    coursePath: "/dashboard",
    highlights: ["All 4 products included", "Save over $80", "20 installable AI tools"],
    badge: "BEST VALUE",
  },
};

export const PRODUCT_ORDER = [
  "starter-kit",
  "skills-builder",
  "small-business",
  "automation-mastery",
  "ultimate-bundle",
];

export const PURCHASABLE_PRODUCTS = PRODUCT_ORDER.filter(
  (id) => id !== "ultimate-bundle"
);

export const FREE_PRODUCTS = ["quick-start"];
