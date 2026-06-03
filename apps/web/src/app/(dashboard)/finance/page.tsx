'use client';

import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function FinancePage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 font-ibm">المالية</h1>
        <p className="text-gray-500 text-sm mt-0.5">متابعة المدفوعات والمصاريف</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-start gap-4">
          <div className="p-3 rounded-[8px] bg-accent">
            <DollarSign size={22} className="text-white" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">إيرادات الشهر</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(0)}</p>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="p-3 rounded-[8px] bg-success">
            <CheckCircle size={22} className="text-white" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">مدفوعات مكتملة</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>
        <div className="card flex items-start gap-4">
          <div className="p-3 rounded-[8px] bg-danger">
            <AlertTriangle size={22} className="text-white" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">متأخرون</p>
            <p className="text-2xl font-bold text-gray-800">0</p>
          </div>
        </div>
      </div>

      {/* Coming soon */}
      <div className="card text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp size={28} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">نظام المالية قادم قريباً</h3>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">
          ستتمكن من تسجيل المدفوعات، متابعة المتأخرين، وطباعة إيصالات الدفع
        </p>
      </div>
    </div>
  );
}
