'use client';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

export type TooltipComponentProps = {
  children: React.ReactNode;
  message: string;
};

const TooltipComponent: React.FC<TooltipComponentProps> = ({
  children,
  message,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>{children}</TooltipTrigger>
        <TooltipContent>{message}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipComponent;
