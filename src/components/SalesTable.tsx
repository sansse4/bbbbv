import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Filter, X, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Download } from "lucide-react";
import { SalesRow } from "@/hooks/useSalesSheetData";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/hooks/use-toast";

interface SalesTableProps {
  rows: SalesRow[];
  isLoading: boolean;
}

const ITEMS_PER_PAGE = 10;

export const SalesTable = ({ rows, isLoading }: SalesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [salesPersonFilter, setSalesPersonFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (value: number | string) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "0";
    return new Intl.NumberFormat("ar-IQ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get unique sales persons and payment types for filters
  const salesPersons = useMemo(() => {
    const persons = new Set(rows.map((r) => r.salesPerson).filter(Boolean));
    return Array.from(persons);
  }, [rows]);

  const paymentTypes = useMemo(() => {
    const types = new Set(rows.map((r) => r.paymentType).filter(Boolean));
    return Array.from(types);
  }, [rows]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        searchTerm === "" ||
        row.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.unitNo?.toString().includes(searchTerm) ||
        row.salesPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.accountantName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSalesPerson =
        salesPersonFilter === "all" || row.salesPerson === salesPersonFilter;

      const matchesPaymentType =
        paymentTypeFilter === "all" || row.paymentType === paymentTypeFilter;

      return matchesSearch && matchesSalesPerson && matchesPaymentType;
    });
  }, [rows, searchTerm, salesPersonFilter, paymentTypeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE);
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const clearFilters = () => {
    setSearchTerm("");
    setSalesPersonFilter("all");
    setPaymentTypeFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || salesPersonFilter !== "all" || paymentTypeFilter !== "all";

  const exportToPDF = () => {
    if (filteredRows.length === 0) {
      toast({ title: "لا توجد بيانات للتصدير", variant: "destructive" });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    
    // Add logo
    const logoUrl = "/roaya-logo.png";
    const img = new Image();
    img.src = logoUrl;
    
    // Calculate totals
    const totalSalePrice = filteredRows.reduce((sum, row) => sum + (typeof row.salePrice === 'number' ? row.salePrice : 0), 0);
    const totalDownPayment = filteredRows.reduce((sum, row) => sum + (typeof row.downPayment === 'number' ? row.downPayment : 0), 0);
    const totalArea = filteredRows.reduce((sum, row) => sum + (typeof row.area === 'number' ? row.area : 0), 0);

    const generatePDF = () => {
      // Try to add logo
      try {
        doc.addImage(img, "PNG", 14, 10, 30, 30);
      } catch {
        // Logo failed to load, continue without it
      }
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(99, 102, 241);
      doc.text("Roaya Real Estate", 50, 22);
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Sales Details Report", 50, 30);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`, 50, 38);
      doc.text(`Total Records: ${filteredRows.length}`, 150, 38);

      // Prepare table data
      const tableData = filteredRows.map((row, index) => [
        (index + 1).toString(),
        row.buyerName || "-",
        row.unitNo?.toString() || "-",
        formatCurrency(row.area),
        formatCurrency(row.salePrice),
        formatCurrency(row.downPayment),
        row.paymentType || "-",
        row.salesPerson || "-",
        row.accountantName || "-",
        row.category || "-",
        row.deliveryDate || "-",
      ]);

      // Add table
      autoTable(doc, {
        head: [["#", "Buyer Name", "Unit No", "Area (m2)", "Sale Price", "Down Payment", "Payment Type", "Sales Person", "Accountant", "Category", "Delivery Date"]],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Add summary section
      const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 50;
      
      doc.setFillColor(245, 245, 255);
      doc.rect(14, finalY + 10, 268, 30, "F");
      
      doc.setFontSize(12);
      doc.setTextColor(99, 102, 241);
      doc.text("Summary", 20, finalY + 20);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Area: ${formatCurrency(totalArea)} m2`, 20, finalY + 30);
      doc.text(`Total Sales: ${formatCurrency(totalSalePrice)}`, 100, finalY + 30);
      doc.text(`Total Down Payments: ${formatCurrency(totalDownPayment)}`, 180, finalY + 30);

      // Save PDF
      doc.save(`sales-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      
      toast({ title: "تم تحميل الملف بنجاح" });
    };

    // Try to load image first
    img.onload = generatePDF;
    img.onerror = generatePDF;
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full">
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                جدول المبيعات التفصيلي
                <Badge variant="secondary" className="mr-2">
                  {filteredRows.length} سجل
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToPDF();
                  }}
                  disabled={filteredRows.length === 0}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
                <Button variant="ghost" size="sm" className="p-1">
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث بالاسم، رقم الوحدة، الموظف..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pr-10"
                />
              </div>

              <Select
                value={salesPersonFilter}
                onValueChange={(value) => {
                  setSalesPersonFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="موظف المبيعات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموظفين</SelectItem>
                  {salesPersons.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={paymentTypeFilter}
                onValueChange={(value) => {
                  setPaymentTypeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطرق</SelectItem>
                  {paymentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 ml-1" />
                  مسح الفلاتر
                </Button>
              )}
            </div>

            {/* Table */}
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-right">#</TableHead>
                      <TableHead className="text-right">اسم المشتري</TableHead>
                      <TableHead className="text-right">رقم الوحدة</TableHead>
                      <TableHead className="text-right">المساحة</TableHead>
                      <TableHead className="text-right">سعر البيع</TableHead>
                      <TableHead className="text-right">المقدمة</TableHead>
                      <TableHead className="text-right">طريقة الدفع</TableHead>
                      <TableHead className="text-right">موظف المبيعات</TableHead>
                      <TableHead className="text-right">المحاسب</TableHead>
                      <TableHead className="text-right">الفئة</TableHead>
                      <TableHead className="text-right">تاريخ الاستلام</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            جاري التحميل...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                          لا توجد بيانات
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRows.map((row, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">
                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{row.buyerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.unitNo}</Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(row.area)} م²</TableCell>
                          <TableCell className="text-primary font-medium">
                            {formatCurrency(row.salePrice)}
                          </TableCell>
                          <TableCell>{formatCurrency(row.downPayment)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{row.paymentType || "-"}</Badge>
                          </TableCell>
                          <TableCell>{row.salesPerson || "-"}</TableCell>
                          <TableCell>{row.accountantName || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.category || "-"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                              {row.deliveryDate || "-"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  عرض {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length)} من{" "}
                  {filteredRows.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    صفحة {currentPage} من {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
