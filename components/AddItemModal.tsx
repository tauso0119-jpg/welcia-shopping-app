'use client';

import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';

type AddItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: { name:string; price: number; quantity: number }) => void;
};

export default function AddItemModal({ isOpen, onClose, onAddItem }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !quantity) return;
    
    onAddItem({ 
      name, 
      price: parseInt(price), 
      quantity: parseInt(quantity) 
    });
    
    setName('');
    setPrice('');
    setQuantity('1');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative border-t-4 border-welcia">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-1 transition-all">
          <X size={24} />
        </button>
        <div className='flex items-center gap-2 mb-6'>
            <ShoppingBag className="text-slate-500" size={28} />
            <h2 className="text-2xl font-black text-slate-700">新しい商品を追加</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-slate-600 mb-1.5">商品名</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 柔軟剤"
              className="form-input w-full px-4 py-3 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-welcia focus:border-transparent transition-shadow"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-bold text-slate-600 mb-1.5">価格 (税抜)</label>
              <input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="例: 498"
                className="form-input w-full px-4 py-3 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-welcia focus:border-transparent transition-shadow"
                required
              />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-bold text-slate-600 mb-1.5">数量</label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
                className="form-input w-full px-4 py-3 border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-welcia focus:border-transparent transition-shadow"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full mt-3 px-4 py-4 text-lg font-bold text-white rounded-full bg-welcia shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300">
            リストに追加する
          </button>
        </form>
      </div>
    </div>
  );
}
