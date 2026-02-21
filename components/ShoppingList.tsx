import { CheckCircle2, Circle, Trash2, ShoppingCart } from 'lucide-react';

type ShoppingItem = {
  id: string; 
  name: string;
  price: number;
  quantity: number;
  inCart: boolean;
};

type ShoppingListProps = {
  items: ShoppingItem[];
  onToggle: (id: string, inCart: boolean) => void;
  onDelete: (id: string) => void;
};

export default function ShoppingList({ items, onToggle, onDelete }: ShoppingListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-3xl shadow-md border">
        <ShoppingCart size={48} className="mx-auto text-slate-300"/>
        <h3 className="text-xl font-bold text-slate-500 mt-4">リストは空です</h3>
        <p className="text-slate-400 mt-2">下のボタンから商品を追加して、<br/>賢くお買い物を始めましょう！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <h2 className="text-xl font-black text-slate-600 px-2 mt-4">買い物リスト</h2>
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-center justify-between bg-white p-4 pr-5 rounded-2xl shadow-md hover:shadow-lg border border-slate-200/80 transition-all duration-300 ${item.inCart ? 'bg-slate-50 text-slate-400' : 'text-slate-800'}`}
        >
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => onToggle(item.id, !item.inCart)} className="p-2 focus:outline-none">
              {item.inCart ? (
                <CheckCircle2 size={28} className="text-welcia shadow-lg shadow-red-200 rounded-full" />
              ) : (
                <Circle size={28} className="text-slate-300 hover:text-slate-400 transition-colors" />
              )}
            </button>
            <div className="flex-1">
              <p className={`font-bold text-lg ${item.inCart ? 'line-through' : ''}`}>
                {item.name}
              </p>
              <p className={`text-sm font-medium ${item.inCart ? 'line-through' : 'text-slate-500'}`}>
                {item.quantity} 点
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`font-black text-xl ${item.inCart ? 'line-through' : 'text-slate-900'}`}>
                ¥{(item.price * item.quantity).toLocaleString()}
            </div>
            <button 
              onClick={() => onDelete(item.id)} 
              className="text-slate-400 hover:text-red-500 hover:bg-red-100/50 rounded-full p-2 transition-all duration-200">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
