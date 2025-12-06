import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({ data, subtotal, taxAmount, discountAmount, total }, ref) => {

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('fa-IR').format(amount);
    };

    return (
      <div
        ref={ref}
        className="print-container bg-amber-50 w-full max-w-[210mm] min-h-[297mm] p-6 print:p-4 mx-auto shadow-lg text-gray-800 flex flex-col relative print:bg-white print:shadow-none print:min-h-0 print:max-h-[297mm] print:overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3 pb-3 border-b-2 border-yellow-600">
          <div className="flex flex-col text-right space-y-1">
            <h1 className="text-2xl print:text-xl font-bold text-yellow-700 mb-1">فاکتور خدمات</h1>
            <div className="bg-white rounded-lg p-2 shadow-sm border border-yellow-200">
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-bold text-gray-700 w-24">شماره فاکتور:</span>
                <span className="font-mono text-yellow-700 text-sm font-bold">{data.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-bold text-gray-700 w-24">تاریخ صدور:</span>
                <span className="font-medium text-gray-900">{data.date}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-gray-700 w-24">تاریخ سررسید:</span>
                <span className="font-medium text-gray-900">{data.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="w-32 h-20 flex justify-end items-start">
            {data.logo ? (
              <img
                src={data.logo}
                alt="Logo"
                className="max-w-full max-h-full object-contain object-left"
              />
            ) : (
              <div className="w-full h-full border-2 border-dashed border-yellow-300 rounded-lg flex items-center justify-center text-yellow-600 text-xs bg-yellow-50">
                محل لوگو
              </div>
            )}
          </div>
        </div>

        {/* Addresses Boxed */}
        <div className="flex gap-3 mb-3">
          {/* Seller */}
          <div className="w-1/2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-300">
            <h3 className="text-yellow-700 text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-yellow-400 pb-1">فروشنده / مجری سرویس</h3>
            <div className="font-bold text-sm text-gray-900">{data.fromName}</div>
            <div className="text-xs text-gray-700 whitespace-pre-line leading-tight">{data.fromAddress}</div>
            <div className="text-xs text-gray-600 mt-1 font-mono">{data.fromEmail}</div>
          </div>

          {/* Buyer */}
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-300">
            <h3 className="text-blue-700 text-[10px] font-bold uppercase tracking-wider mb-1 border-b border-blue-400 pb-1">خریدار / مسافر</h3>
            <div className="font-bold text-sm text-gray-900">{data.toName}</div>
            <div className="text-xs text-gray-700 whitespace-pre-line leading-tight">{data.toAddress}</div>
            <div className="text-xs text-gray-600 mt-1 font-mono">{data.toEmail}</div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-3">
          <table className="w-full border-collapse shadow-sm rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                <th className="py-2 px-2 text-right text-xs font-bold">شرح خدمات / مسیر</th>
                <th className="py-2 px-2 text-center text-xs font-bold w-20">تعداد/ساعت</th>
                <th className="py-2 px-2 text-left text-xs font-bold w-24">مبلغ واحد</th>
                <th className="py-2 px-2 text-left text-xs font-bold w-28">مبلغ کل</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'}>
                  <td className="py-1.5 px-2 text-xs text-gray-800 border-b border-yellow-200">{item.description}</td>
                  <td className="py-1.5 px-2 text-center text-xs font-medium border-b border-yellow-200">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-left text-xs text-gray-600 font-mono border-b border-yellow-200" dir="ltr">{formatCurrency(item.rate)}</td>
                  <td className="py-1.5 px-2 text-left text-xs font-bold text-gray-900 font-mono border-b border-yellow-200" dir="ltr">{formatCurrency(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-xs bg-yellow-50 rounded-b-lg border-t border-yellow-200">
              هیچ سرویسی درج نشده است
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-3">
          <div className="w-64 bg-gradient-to-br from-yellow-100 to-amber-100 p-3 rounded-lg border border-yellow-400">
            <div className="flex justify-between py-1 text-gray-700 text-xs">
              <span className="font-semibold">جمع کل خدمات:</span>
              <span dir="ltr" className="font-mono font-bold">{formatCurrency(subtotal)} {data.currency}</span>
            </div>

            {data.discountRate > 0 && (
              <div className="flex justify-between py-1 text-green-700 text-xs">
                <span className="font-semibold">تخفیف ({data.discountRate}%):</span>
                <span dir="ltr" className="font-mono font-bold">-{formatCurrency(discountAmount)} {data.currency}</span>
              </div>
            )}

            {data.taxRate > 0 && (
              <div className="flex justify-between py-1 text-gray-700 text-xs">
                <span className="font-semibold">مالیات و عوارض ({data.taxRate}%):</span>
                <span dir="ltr" className="font-mono font-bold">{formatCurrency(taxAmount)} {data.currency}</span>
              </div>
            )}

            <div className="border-t border-yellow-500 my-2"></div>

            <div className="flex justify-between py-1 text-base font-bold text-yellow-800">
              <span>مبلغ قابل پرداخت:</span>
              <span dir="ltr" className="font-mono">{formatCurrency(total)} {data.currency}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Signatures - Side by Side */}
        <div className="mt-auto flex gap-4 items-end pb-2">
          {/* Notes Section */}
          <div className="flex-1">
            {data.notes && (
              <div>
                <h4 className="text-[10px] font-bold text-yellow-700 uppercase mb-1 bg-yellow-100 px-2 py-0.5 rounded-t border-b border-yellow-400">توضیحات / اطلاعات مسافر</h4>
                <p className="text-[10px] text-gray-700 bg-white p-2 rounded-b border border-yellow-200 whitespace-pre-line">{data.notes}</p>
              </div>
            )}
          </div>

          {/* Signature Section */}
          <div className="text-center flex-shrink-0">
            <div className="h-16 w-28 mb-1 mx-auto flex items-center justify-center bg-white rounded border border-yellow-300 p-1">
              {data.companySignature ? (
                <img
                  src={data.companySignature}
                  alt="Company Signature"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="h-full w-full border-b border-dashed border-yellow-400"></div>
              )}
            </div>
            <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-3 py-0.5 rounded-full">مهر و امضای شرکت</span>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';