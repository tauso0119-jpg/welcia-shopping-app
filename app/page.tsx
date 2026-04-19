"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Home, Plus, CheckCircle2, Trash2, Coins, MapPin, Settings, X, Edit2, RotateCcw, Send, ChevronDown } from 'lucide-react';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, setDoc, writeBatch } from 'firebase/firestore';

const DebouncedInput = ({ value, onChange, label, type = "number" }: any) => {
  const [innerValue, setInnerValue] = useState(value);
  useEffect(() => { setInnerValue(value); }, [value]);
  return (
    <div className="flex-1 bg-gray-50 rounded-lg px-2 py-1 border border-transparent focus-within:border-red-200 transition-all">
      <span className="text-[9px] text-gray-400 block font-bold">{label}</span>
      <input type={type} value={innerValue} onChange={(e) => { setInnerValue(e.target.value); onChange(e.target.value); }} onFocus={(e) => e.target.select()} className="w-full bg-transparent border-none p-0 font-bold focus:ring-0 text-gray-700 font-sans" />
    </div>
  );
};

export default function WelKatsuApp() {
  const [activeTab, setActiveTab] = useState('shop');
  const [points, setPoints] = useState(0);
  const [inventory, setInventory] = useState<any[]>([]);
  const [categories, setCategories] = useState(["キッチン", "お風呂", "洗面所", "トイレ"]);
  const [locations, setLocations] = useState(["パントリー", "廊下収納", "洗面台下", "なし"]);
  const [selectedLoc, setSelectedLoc] = useState("すべて");
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", realName: "", cat: "キッチン", loc: "パントリー", loc2: "なし" });
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newCatInput, setNewCatInput] = useState("");
  const [newLocInput, setNewLocInput] = useState("");

  useEffect(() => {
    const q = query(collection(db, "inventory"), orderBy("name"));
    const unsubInventory = onSnapshot(q, (snapshot) => {
      setInventory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[]);
    });
    onSnapshot(doc(db, "settings", "points"), (doc) => {
      if (doc.exists()) setPoints(Number(doc.data().value || 0));
    });
    onSnapshot(doc(db, "settings", "masters"), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.categories) setCategories(data.categories);
        if (data.locations) setLocations([...data.locations, "なし"]);
      }
    });
  }, []);

  const budget = Math.floor(Number(points) * 1.5);
  const totalSpent = inventory.filter((i: any) => i.toBuy).reduce((sum, i) => sum + (Number(i.price || 0) * Number(i.quantity || 1)), 0);
  const remaining = budget - totalSpent;

  const finishShopping = async () => {
    if (!confirm("買い物完了！全商品をリセットして次回の在庫チェックを始めますか？")) return;
    const batch = writeBatch(db);
    inventory.forEach((i: any) => {
      batch.update(doc(db, "inventory", i.id), { toBuy: false, isPacked: false, isChecking: true });
    });
    await batch.commit();
    setActiveTab('stock');
  };

  const confirmToBuyList = async () => {
    const batch = writeBatch(db);
    inventory.forEach((i: any) => {
      batch.update(doc(db, "inventory", i.id), { toBuy: !!i.isChecking });
    });
    await batch.commit();
    setActiveTab('shop');
  };

  const addItem = async () => {
    if (!form.name.trim()) return;
    try {
      await addDoc(collection(db, "inventory"), { ...form, price: 0, quantity: 1, toBuy: false, isPacked: false, isChecking: true });
      setForm({ ...form, name: "", realName: "" });
      alert("登録しました！");
      setActiveTab('stock');
    } catch (e) {
      alert("登録に失敗しました。Firebaseのルール設定を確認してください。");
    }
  };

  const getLocCount = (locName: string) => {
    if (locName === "すべて") return inventory.filter(i => i.isChecking).length;
    return inventory.filter(i => i.isChecking && (i.loc === locName || i.loc2 === locName)).length;
  };

  const filteredStockList = inventory
    .filter((i: any) => selectedLoc === "すべて" || i.loc === selectedLoc || i.loc2 === selectedLoc)
    .sort((a, b) => {
      if (a.isChecking !== b.isChecking) return b.isChecking ? -1 : 1;
      const countA = inventory.filter(i => i.loc === a.loc || i.loc2 === a.loc).length;
      const countB = inventory.filter(i => i.loc === b.loc || i.loc2 === b.loc).length;
      return countB - countA;
    });

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24 font-sans text-slate-800 tracking-tight">
      {activeTab === 'shop' && (
        <div className="sticky top-0 z-50 bg-[#f8f9fa]/80 backdrop-blur-md px-4 py-3 border-b border-gray-200">
          <div className={`rounded-2xl p-4 shadow-lg text-white transition-all duration-500 ${remaining < 0 ? 'bg-orange-600' : 'bg-gradient-to-br from-[#ff4b4b] to-[#ff7676]'}`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest text-white/90">残金</span>
                <span className="text-3xl font-black italic tracking-tighter">¥{remaining.toLocaleString()}</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 flex flex-col items-end border border-white/10">
                <span className="text-[9px] font-bold opacity-90 mb-1 flex items-center gap-1 font-sans"><Coins size={10} /> 所持ポイント</span>
                <input type="number" value={points === 0 ? "" : points} onChange={(e) => { const v = e.target.value === "" ? 0 : Number(e.target.value); setPoints(v); setDoc(doc(db, "settings", "points"), { value: v }); }} className="w-20 bg-transparent border-none p-0 text-right text-lg font-black focus:ring-0 leading-none text-white font-sans" />
              </div>
            </div>
            <div className="text-[10px] font-bold opacity-90 border-t border-white/20 pt-2 font-sans">予算: ¥{budget.toLocaleString()} / 合計: ¥{totalSpent.toLocaleString()}</div>
          </div>
        </div>
      )}

      <main className="px-4">
        {activeTab === 'shop' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex justify-between items-center my-4">
              <h1 className="text-xl font-black font-sans">🛒 買い物リスト</h1>
              <button onClick={finishShopping} className="bg-gray-800 text-white text-[10px] font-black px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all font-sans"><RotateCcw size={12} /> 完了/次回の準備</button>
            </div>
            <div className="space-y-3">
              {inventory.filter((i: any) => i.toBuy).sort((a: any, b: any) => Number(a.isPacked) - Number(b.isPacked)).map((item: any) => (
                <div key={item.id} className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${item.isPacked ? 'opacity-50 grayscale border-gray-100' : 'border-white'}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => updateDoc(doc(db, "inventory", item.id), { isPacked: !item.isPacked })} className={`mt-1 transition-colors ${item.isPacked ? 'text-green-500' : 'text-gray-300'}`}><CheckCircle2 size={28} /></button>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className={`${item.isPacked ? 'line-through font-bold text-gray-400 font-sans' : 'font-bold text-lg text-gray-800 font-sans'}`}>{item.name}</div>
                          <div className="text-[10px] text-gray-400 font-medium font-sans mt-0.5">{item.realName}</div>
                        </div>
                        <span className="shrink-0 text-[9px] font-black bg-gray-100 px-2 py-1 rounded-lg text-gray-500 flex items-center gap-1 font-sans"><MapPin size={8}/>{item.loc}</span>
                      </div>
                      {!item.isPacked && (
                        <div className="flex items-center gap-2 mt-3">
                          <DebouncedInput label="個数" value={item.quantity} onChange={(val: any) => updateDoc(doc(db, "inventory", item.id), { quantity: Number(val) })} />
                          <DebouncedInput label="単価(税込)" value={item.price} onChange={(val: any) => updateDoc(doc(db, "inventory", item.id), { price: Number(val) })} />
                        </div>
                      )}
                      <div className="text-right mt-2 text-[#ff4b4b] font-black italic text-sm font-sans">¥{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="animate-in slide-in-from-right duration-300 pt-4 pb-4">
            <div className="flex justify-between items-end mb-4 font-sans">
              <div className="space-y-1">
                <h1 className="text-xl font-black font-sans">🏠 在庫確認</h1>
                <button onClick={() => setIsLocModalOpen(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-all font-sans">
                  <MapPin size={12} className="text-[#ff4b4b]" /><span className="text-xs font-black text-gray-700 font-sans">{selectedLoc} ({getLocCount(selectedLoc)})</span><ChevronDown size={12} className="text-gray-400" />
                </button>
              </div>
              <button onClick={confirmToBuyList} className="bg-[#ff4b4b] text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all font-sans"><Send size={12} /> リストを更新</button>
            </div>
            <div className="space-y-2 font-sans">
              {filteredStockList.map((item: any) => (
                <div key={item.id} className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${item.isChecking ? 'border-[#ff4b4b]/30 ring-1 ring-[#ff4b4b]/10' : 'opacity-40 border-gray-100'}`}>
                  <div className="flex items-center justify-between font-sans">
                    <div>
                      <div className={`font-bold font-sans ${item.isChecking ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-medium font-sans">{item.realName}</div>
                      <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-1 font-sans"><MapPin size={10}/>{item.loc}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateDoc(doc(db, "inventory", item.id), { isChecking: !item.isChecking })} className={`px-5 py-2 rounded-full text-xs font-black transition-all shadow-sm font-sans ${item.isChecking ? 'bg-[#ff4b4b] text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>{item.isChecking ? '買う' : '在庫あり'}</button>
                      <button onClick={() => { setEditingItem(item); setForm({ name: item.name, realName: item.realName, cat: item.cat, loc: item.loc, loc2: item.loc2 || "なし" }); }} className="text-gray-300 font-sans"><Settings size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="animate-in slide-in-from-bottom duration-300 pt-4 font-sans"><h1 className="text-xl font-black my-4 font-sans">➕ 新規登録</h1><div className="space-y-4 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 font-sans"><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="用品名 (例: シャンプー)" className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold font-sans" /><input value={form.realName} onChange={e => setForm({...form, realName: e.target.value})} placeholder="具体名 (例: パンテーン詰め替え)" className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm font-sans" /><div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-gray-400 font-sans"><div className="flex flex-col gap-1 font-sans">カテゴリ<select value={form.cat} onChange={e => setForm({...form, cat: e.target.value})} className="bg-gray-50 border-none rounded-xl p-3 text-sm text-gray-800 font-sans">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="flex flex-col gap-1 font-sans">場所1<select value={form.loc} onChange={e => setForm({...form, loc: e.target.value})} className="bg-gray-50 border-none rounded-xl p-3 text-sm text-gray-800 font-sans">{locations.filter(l => l !== "なし").map(l => <option key={l} value={l}>{l}</option>)}</select></div></div><button onClick={addItem} className={`w-full font-black py-4 rounded-2xl shadow-lg mt-4 transition-all font-sans ${form.name.trim() ? 'bg-[#ff4b4b] text-white active:scale-95' : 'bg-gray-100 text-gray-400'}`}>登録</button></div></div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in pt-4 pb-10 font-sans">
            <h1 className="text-xl font-black my-4 font-sans">⚙️ 設定</h1>
            <div className="space-y-6 font-sans">
              <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm font-sans">
                <h2 className="text-[10px] font-black mb-3 text-gray-400 uppercase tracking-widest font-sans">カテゴリ管理</h2>
                <div className="flex w-full gap-2 mb-4 font-sans">
                  <input value={newCatInput} onChange={e => setNewCatInput(e.target.value)} placeholder="名前..." className="flex-1 w-full bg-gray-100 border-none rounded-xl p-3 font-bold text-sm focus:ring-0 font-sans" />
                  <button onClick={() => { if(newCatInput){ const n = [...categories, newCatInput]; setCategories(n); setDoc(doc(db, "settings", "masters"), { categories: n, locations: locations.filter(l => l !== "なし") }, { merge: true }); setNewCatInput(""); } }} className="w-20 shrink-0 bg-gray-800 text-white rounded-xl font-black text-xs active:scale-95 font-sans">追加</button>
                </div>
                <div className="flex flex-wrap gap-2 font-sans">{categories.map(c => <span key={c} className="bg-gray-50 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 text-gray-600 border border-gray-100 font-sans">{c} <X size={12} className="text-gray-400" onClick={() => { if(confirm("消す？")){ const n = categories.filter(x => x !== c); setCategories(n); setDoc(doc(db, "settings", "masters"), { categories: n, locations: locations.filter(l => l !== "なし") }, { merge: true }); } }} /></span>)}</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {isLocModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-md flex flex-col justify-end font-sans">
          <div className="bg-white rounded-t-[40px] max-h-[85vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-black font-sans">場所で絞り込む</h2><button onClick={() => setIsLocModalOpen(false)} className="bg-gray-100 p-2 rounded-full font-sans"><X size={20}/></button></div>
            <div className="grid grid-cols-1 gap-3 pb-10 font-sans">{["すべて", ...locations.filter(l => l !== "なし")].map(loc => (
              <button key={loc} onClick={() => { setSelectedLoc(loc); setIsLocModalOpen(false); }} className={`w-full text-left p-5 rounded-2xl font-black transition-all flex justify-between items-center font-sans ${selectedLoc === loc ? 'bg-[#ff4b4b] text-white shadow-lg' : 'bg-gray-50 text-gray-700 active:bg-gray-100'}`}>
                <span>{loc}</span><span className={`text-xs px-2 py-1 rounded-full ${selectedLoc === loc ? 'bg-white/20' : 'bg-gray-200 text-gray-500'}`}>{getLocCount(loc)}</span>
              </button>
            ))}</div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-6 font-sans">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-5 font-sans">
            <div className="flex justify-between items-center"><h2 className="text-xl font-black flex items-center gap-2 font-sans"><Edit2 size={20} className="text-[#ff4b4b]"/> 編集</h2><button onClick={() => setEditingItem(null)} className="text-gray-300 bg-gray-100 p-2 rounded-full font-sans"><X size={20}/></button></div>
            <div className="space-y-4 font-sans">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold font-sans" placeholder="用品名" />
              <input value={form.realName} onChange={e => setForm({...form, realName: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm font-sans" placeholder="具体名" />
            </div>
            <button onClick={() => {updateDoc(doc(db,"inventory",editingItem.id),form);setEditingItem(null);}} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl shadow-lg font-sans">保存</button>
            <button onClick={() => {deleteDoc(doc(db,"inventory",editingItem.id));setEditingItem(null);}} className="w-full text-red-400 font-bold py-2 text-xs flex items-center justify-center gap-1 opacity-50 font-sans"><Trash2 size={14}/> 削除</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] font-sans">
        <button onClick={() => setActiveTab('shop')} className={`flex flex-col items-center flex-1 transition-all ${activeTab === 'shop' ? 'text-[#ff4b4b] scale-110' : 'text-gray-300'}`}><ShoppingCart size={22} /><span className="text-[9px] font-black mt-1 font-sans">買い物</span></button>
        <button onClick={() => setActiveTab('stock')} className={`flex flex-col items-center flex-1 transition-all ${activeTab === 'stock' ? 'text-[#ff4b4b] scale-110' : 'text-gray-300'}`}><Home size={22} /><span className="text-[9px] font-black mt-1 font-sans">在庫確認</span></button>
        <button onClick={() => setActiveTab('add')} className={`flex flex-col items-center flex-1 transition-all ${activeTab === 'add' ? 'text-[#ff4b4b] scale-110' : 'text-gray-300'}`}><Plus size={22} /><span className="text-[9px] font-black mt-1 font-sans">新規追加</span></button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center flex-1 transition-all ${activeTab === 'settings' ? 'text-[#ff4b4b] scale-110' : 'text-gray-300'}`}><Settings size={22} /><span className="text-[9px] font-black mt-1 font-sans">設定</span></button>
      </nav>
    </div>
  );
}
