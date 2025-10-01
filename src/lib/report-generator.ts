
'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { jsPDF as jsPDFType } from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Tenant, Payment, Property } from './types';

// Extend the jsPDF interface to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const addHeader = (doc: jsPDFType) => {
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text('PropBot', 14, 22);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Report Generated: ${format(new Date(), 'PPP')}`, 14, 28);
};

const addFooter = (doc: jsPDFType, pageCount: number) => {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
};

export const generateTenantListPDF = (tenants: Tenant[]) => {
  const doc = new jsPDF();
  addHeader(doc);

  const tableColumn = ["Name", "Property", "Unit", "Phone", "Email", "Rent Status"];
  const tableRows: (string | number)[][] = [];

  tenants.forEach(tenant => {
    const tenantData = [
      tenant.name,
      tenant.property,
      tenant.unit,
      tenant.phone,
      tenant.email,
      tenant.rentStatus,
    ];
    tableRows.push(tenantData);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    headStyles: { fillColor: [3, 105, 161] }, // HSL 205 90% 55% -> RGB
    theme: 'striped',
  });

  const pageCount = doc.internal.getNumberOfPages();
  addFooter(doc, pageCount);
  
  doc.save(`PropBot_Tenant_List_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const generateTenantListExcel = (tenants: Tenant[]) => {
  const worksheet = XLSX.utils.json_to_sheet(
    tenants.map(t => ({
      Name: t.name,
      Property: t.property,
      Unit: t.unit,
      Phone: t.phone,
      Email: t.email,
      'Rent Status': t.rentStatus,
      'Rent Amount': t.rentAmount,
      'Lease Start': t.leaseStartDate,
      'Lease End': t.leaseEndDate,
    }))
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenants');
  XLSX.writeFile(workbook, `PropBot_Tenant_List_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

// Add other report generation functions as needed (e.g., for financials)
