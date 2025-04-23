
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
      flex items-center justify-center gap-2
      px-4 py-2 rounded-lg transition-all font-semibold select-none 
      border-2 focus:outline-none focus:ring-2 focus:ring-primary
      ${active ? operationStyles[operation] : "bg-white border-transparent text-muted-foreground shadow hover:bg-muted"}
    `}
    style={{
      minWidth: 72,
      fontSize: "1.14rem",
      margin: 0
    }}
    aria-pressed={active}
    onClick={() => onClick(operation)}
  >
    <span className="flex items-center justify-center w-6 h-6">
      <MathIcon operation={operation} size={22} />
    </span>
    <span className="capitalize hidden xs:inline">{operation.charAt(0).toUpperCase() + operation.slice(1)}</span>
  </button>
);

export default OperationButton;
