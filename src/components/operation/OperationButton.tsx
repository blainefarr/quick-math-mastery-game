
import React from "react";
import { Operation } from "@/types";
import MathIcon from "../common/MathIcon";

type Props = {
  active: boolean;
  operation: Operation;
  onClick: (operation: Operation) => void;
};

const operationStyles: Record<Operation, string> = {
  addition: "bg-blue-200 border-2 border-blue-400 shadow font-bold text-primary",
  subtraction: "bg-green-200 border-2 border-green-400 shadow font-bold text-primary",
  multiplication: "bg-purple-200 border-2 border-purple-400 shadow font-bold text-primary",
  division: "bg-orange-200 border-2 border-orange-400 shadow font-bold text-primary",
};

const OperationButton = ({ active, operation, onClick }: Props) => (
  <button
    type="button"
    className={`
      flex items-center justify-center
      h-10 w-20 rounded-lg transition-all
      flex-shrink-0
      ${active ? operationStyles[operation] : "bg-white border-2 border-transparent text-muted-foreground shadow hover:bg-muted"}
    `}
    aria-pressed={active}
    onClick={() => onClick(operation)}
  >
    <MathIcon operation={operation} size={24} />
  </button>
);

export default OperationButton;
