import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  const description = `Explore World ${id} on AWE Platform. View project details, fundraising progress, tokenomics, and join the community.`;

  return {
    title: "World.fun Alpha",
    description,
    openGraph: {
      title: "World.fun Alpha",
      description,
      type: "website",
      // TODO: add image if needed
      //   images: [
      //     {
      //       url: "/images/og-world-default.jpg", // TODO: You'll need to add this image
      //       width: 1200,
      //       height: 630,
      //       alt: `${worldTitle} Preview`,
      //     },
      //   ],
    },
  };
}

export default function WorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
