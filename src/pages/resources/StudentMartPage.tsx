import React from 'react';
import ResourcePageLayout from './ResourcePageLayout';
import { ShoppingBag, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const items = [
  { id: 1, name: 'Medical Biochemistry Textbook', price: 'N3,500', category: 'Books' },
  { id: 2, name: 'Table Fan (Rechargeable)', price: 'N15,000', category: 'Appliances' },
  { id: 3, name: 'Reading Lamp', price: 'N4,000', category: 'Appliances' },
];

const StudentMartPage = () => {
  return (
    <ResourcePageLayout
      title="Student Mart"
      description="Buy and sell textbooks, gadgets, and hostel essentials within the campus."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 hover:shadow-lg transition-all">
            <div className="aspect-square bg-slate-50 rounded-lg mb-4 flex items-center justify-center">
              <ShoppingBag size={32} className="text-slate-300" />
            </div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-slate-900">{item.name}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full mt-1 inline-block">{item.category}</span>
              </div>
              <span className="font-bold text-teal-600">{item.price}</span>
            </div>
            <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">Contact Seller</Button>
          </div>
        ))}
      </div>
    </ResourcePageLayout>
  );
};

export default StudentMartPage;
