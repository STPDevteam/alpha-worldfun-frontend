import { Globe } from "lucide-react";
import { SVGProps } from "react";

export const WebsiteIcon = ({
  className,
  ...props
}: SVGProps<SVGSVGElement>) => (
  <Globe className={className} color="#F5F3FF" {...props} />
);
