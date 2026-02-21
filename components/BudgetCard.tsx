import { PiggyBank, CircleDollarSign } from 'lucide-react';

type BudgetCardProps = {
  budget: number;
  usedAmount: number;
  tpoints: number;
};

export default function BudgetCard({ budget, usedAmount, tpoints }: BudgetCardProps) {
  const remainingBudget = budget - usedAmount;
  const budgetUsagePercentage = (usedAmount / budget) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-500 p-6 w-full text-slate-800 border-t-4 border-welcia">
      <div className="flex justify-between items-start mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <PiggyBank className="text-slate-500" size={28} />
          <span className="font-black text-slate-700">今月のウェル活予算</span>
        </h2>
        <div className="font-bold text-sm bg-amber-400/20 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
          <CircleDollarSign size={16}/>
          <span>{tpoints.toLocaleString()} pt</span>
        </div>
      </div>

      <div className="text-center my-6">
        <p className="text-base text-slate-500">残金</p>
        <p className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-700 to-slate-900">
          ¥{remainingBudget.toLocaleString()}
        </p>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-slate-200/70 rounded-full h-3.5 mb-2 shadow-inner">
        <div
          className="bg-gradient-to-r from-red-500 to-welcia h-3.5 rounded-full transition-all duration-700 ease-out-cubic shadow-md"
          style={{ width: `${budgetUsagePercentage}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-base font-semibold text-slate-600 mt-3">
        <p>¥{usedAmount.toLocaleString()} <span className="font-normal text-sm">使用済み</span></p>
        <p><span className="font-normal text-sm">予算:</span> ¥{budget.toLocaleString()}</p>
      </div>
    </div>
  );
}
