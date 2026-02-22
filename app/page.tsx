'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import BudgetCard from '@/components/BudgetCard';
import ShoppingList from '@/components/ShoppingList';
import AddItemModal from '@/components/AddItemModal';
import { PlusCircle } from 'lucide-react';

interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inCart: boolean;
}

// Firestoreのデータをフェッチするための関数
const fetcher = (collectionName: string): Promise<ShoppingItem[]> => {
  return new Promise((resolve) => {
    const q = collection(db, collectionName);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ShoppingItem[];
      resolve(data);
    });
    // SWRがアンマウントされた時にunsubscribeするためのクリーンアップ関数を返す
    return () => unsubscribe();
  });
};

export default function Home() {
  // Firestoreから買い物リストのデータを取得
  const { data: shoppingItems, error } = useSWR<ShoppingItem[]>('shopping-list', fetcher);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // モックデータ（将来的にはFirestoreから取得）
  const budget = 25000;
  const usedAmount = shoppingItems?.filter(item => item.inCart).reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const tpoints = 16667;

  // 新しい商品をFirestoreに追加
  const handleAddItem = async (item: { name: string; price: number; quantity: number }) => {
    await addDoc(collection(db, 'shopping-list'), {
      ...item,
      inCart: false,
    });
  };

  // 商品のチェック状態を更新
  const handleToggleItem = async (id: string, inCart: boolean) => {
    const itemRef = doc(db, 'shopping-list', id);
    await updateDoc(itemRef, { inCart });
  };

  // 商品を削除
  const handleDeleteItem = async (id: string) => {
    const itemRef = doc(db, 'shopping-list', id);
    await deleteDoc(itemRef);
  };

  if (error) return <div className='text-red-500 font-bold text-center p-8'>データの読み込みに失敗しました。</div>;
  if (!shoppingItems) return <div className='text-gray-500 font-bold text-center p-8'>読み込み中...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="p-4 bg-gradient-to-r from-red-500 to-welcia shadow-lg">
        <h1 className="text-2xl font-black text-center text-white tracking-wider">
          星家在庫管理
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        <div className="sticky top-0 z-10 p-4 bg-slate-50/80 backdrop-blur-md">
          <BudgetCard
            budget={budget}
            usedAmount={usedAmount}
            tpoints={tpoints}
          />
        </div>

        <div className="px-4">
          <ShoppingList 
            items={shoppingItems} 
            onToggle={handleToggleItem}
            onDelete={handleDeleteItem}
          />
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-transparent">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-5 py-4 text-xl font-bold text-white rounded-full bg-welcia shadow-xl hover:bg-red-700 transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300">
          <PlusCircle size={28} />
          <span>商品を追加</span>
        </button>
      </footer>

      <AddItemModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
}
