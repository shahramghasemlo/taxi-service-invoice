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
        className="print-container bg-amber-50 w-full max-w-[210mm] min-h-[297mm] p-12 mx-auto shadow-lg text-gray-800 flex flex-col relative print:bg-white"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b-4 border-yellow-600">
          <div className="flex flex-col text-right space-y-3">
            <h1 className="text-4xl font-bold text-yellow-700 mb-2">فاکتور خدمات</h1>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-yellow-200">
              <div className="flex items-center gap-3 text-sm mb-2">
                <span className="font-bold text-gray-700 w-28">شماره فاکتور:</span>
                <span className="font-mono text-yellow-700 text-lg font-bold">{data.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm mb-2">
                <span className="font-bold text-gray-700 w-28">تاریخ صدور:</span>
                <span className="font-medium text-gray-900">{data.date}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="font-bold text-gray-700 w-28">تاریخ سررسید:</span>
                <span className="font-medium text-gray-900">{data.dueDate}</span>
              </div>
            </div>
          </div>

          <div className="w-48 h-32 flex justify-end items-start pl-2">
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
        <div className="flex gap-6 mb-6">
          {/* Seller */}
          <div className="w-1/2 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-5 border-2 border-yellow-300 shadow-sm">
            <h3 className="text-yellow-700 text-xs font-bold uppercase tracking-wider mb-3 border-b-2 border-yellow-400 pb-2">فروشنده / مجری سرویس</h3>
            <div className="font-bold text-lg text-gray-900 mb-1">{data.fromName}</div>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{data.fromAddress}</div>
            <div className="text-sm text-gray-600 mt-2 font-mono">{data.fromEmail}</div>
          </div>

          {/* Buyer */}
          <div className="w-1/2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-5 border-2 border-blue-300 shadow-sm">
            <h3 className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-3 border-b-2 border-blue-400 pb-2">خریدار / مسافر</h3>
            <div className="font-bold text-lg text-gray-900 mb-1">{data.toName}</div>
            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{data.toAddress}</div>
            <div className="text-sm text-gray-600 mt-2 font-mono">{data.toEmail}</div>
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-6">
          <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-yellow-600 to-amber-600 text-white">
                <th className="py-4 px-4 text-right text-sm font-bold">شرح خدمات / مسیر</th>
                <th className="py-4 px-4 text-center text-sm font-bold w-24">تعداد/ساعت</th>
                <th className="py-4 px-4 text-left text-sm font-bold w-32">مبلغ واحد</th>
                <th className="py-4 px-4 text-left text-sm font-bold w-36">مبلغ کل</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.items.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'}>
                  <td className="py-3 px-4 text-sm text-gray-800 border-b border-yellow-200">{item.description}</td>
                  <td className="py-3 px-4 text-center text-sm font-medium border-b border-yellow-200">{item.quantity}</td>
                  <td className="py-3 px-4 text-left text-sm text-gray-600 font-mono border-b border-yellow-200" dir="ltr">{formatCurrency(item.rate)}</td>
                  <td className="py-3 px-4 text-left text-sm font-bold text-gray-900 font-mono border-b border-yellow-200" dir="ltr">{formatCurrency(item.quantity * item.rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm bg-yellow-50 rounded-b-lg border-t border-yellow-200">
              هیچ سرویسی درج نشده است
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-80 bg-gradient-to-br from-yellow-100 to-amber-100 p-6 rounded-xl border-2 border-yellow-400 shadow-lg">
            <div className="flex justify-between py-2 text-gray-700 text-sm">
              <span className="font-semibold">جمع کل خدمات:</span>
              <span dir="ltr" className="font-mono font-bold">{formatCurrency(subtotal)} {data.currency}</span>
            </div>

            {data.discountRate > 0 && (
              <div className="flex justify-between py-2 text-green-700 text-sm">
                <span className="font-semibold">تخفیف ({data.discountRate}%):</span>
                <span dir="ltr" className="font-mono font-bold">-{formatCurrency(discountAmount)} {data.currency}</span>
              </div>
            )}

            {data.taxRate > 0 && (
              <div className="flex justify-between py-2 text-gray-700 text-sm">
                <span className="font-semibold">مالیات و عوارض ({data.taxRate}%):</span>
                <span dir="ltr" className="font-mono font-bold">{formatCurrency(taxAmount)} {data.currency}</span>
              </div>
            )}

            <div className="border-t-2 border-yellow-500 my-3"></div>

            <div className="flex justify-between py-2 text-xl font-bold text-yellow-800">
              <span>مبلغ قابل پرداخت:</span>
              <span dir="ltr" className="font-mono">{formatCurrency(total)} {data.currency}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Signatures */}
        <div className="mt-auto">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              {data.notes && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-yellow-700 uppercase mb-2 bg-yellow-100 px-3 py-1 rounded-t-lg border-b-2 border-yellow-400">توضیحات / اطلاعات مسافر</h4>
                  <p className="text-xs text-gray-700 bg-white p-3 rounded-b-lg border-2 border-yellow-200 whitespace-pre-line">{data.notes}</p>
                </div>
              )}
            </div>
            <div>
              {data.terms && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-blue-700 uppercase mb-2 bg-blue-100 px-3 py-1 rounded-t-lg border-b-2 border-blue-400">شرایط پرداخت</h4>
                  <p className="text-xs text-gray-700 bg-white p-3 rounded-b-lg border-2 border-blue-200 whitespace-pre-line">{data.terms}</p>
                </div>
              )}
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-between items-end px-8 pb-4 mt-8">
            <div className="text-center">
              <div className="h-24 w-40 mb-2 mx-auto flex items-center justify-center bg-white rounded-lg border-2 border-yellow-300 p-2">
                {data.companySignature ? (
                  <img
                    src={data.companySignature}
                    alt="Company Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full border-b-2 border-dashed border-yellow-400"></div>
                )}
              </div>
              <span className="text-sm font-bold text-yellow-700 bg-yellow-100 px-4 py-1 rounded-full">مهر و امضای شرکت</span>
            </div>
            <div className="text-center">
              <div className="h-24 w-40 mb-2 mx-auto flex items-center justify-center bg-white rounded-lg border-2 border-blue-300 p-2">
                {data.customerSignature ? (
                  <img
                    src={data.customerSignature}
                    alt="Customer Signature"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full border-b-2 border-dashed border-blue-400"></div>
                )}
              </div>
              <span className="text-sm font-bold text-blue-700 bg-blue-100 px-4 py-1 rounded-full">مهر و امضای مشتری</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePreview.displayName = 'InvoicePreview';