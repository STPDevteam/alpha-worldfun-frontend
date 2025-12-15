import { Text } from "@/components/ui";
import { InfoIcon } from "lucide-react";

export const FormWithLabel = ({
  label,
  required,
  children,
  append,
  tooltip,
  description,
  onClickAppend,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  append?: React.ReactNode;
  tooltip?: string;
  description?: string;
  onClickAppend?: () => void;
}) => {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between" onClick={onClickAppend}>
        <div className="flex items-center gap-1.5">
          <Text weight="medium" className="text-white">
            {label}
            {required && <span>{" *"}</span>}
          </Text>
          {tooltip && <InfoIcon className="w-4 h-4 text-grey-300" />}
        </div>
        {append ? append : null}
      </div>
      {description && <Text className="text-grey-300">{description}</Text>}
      {children}
    </div>
  );
};
