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
import { Search, Filter, X, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { SalesRow } from "@/hooks/useSalesSheetData";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          جدول المبيعات التفصيلي
          <Badge variant="secondary" className="mr-2">
            {filteredRows.length} سجل
          </Badge>
        </CardTitle>
      </CardHeader>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        جاري التحميل...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
    </Card>
  );
};
