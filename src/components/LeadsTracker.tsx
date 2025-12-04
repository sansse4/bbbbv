import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useImportedSales } from "@/hooks/useImportedSales";
import { Users, Phone, Home, RefreshCw, MapPin, Briefcase } from "lucide-react";

export const LeadsTracker = () => {
  const { sales: leads, isLoading, error, refetch } = useImportedSales();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            العملاء المحتملين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          العملاء المحتملين ({leads.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد عملاء محتملين حالياً
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>المهنة</TableHead>
                    <TableHead>عدد افراد الاسرة</TableHead>
                    <TableHead>فئة الدار</TableHead>
                    <TableHead>رقم الدار</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.address || "-"}</TableCell>
                      <TableCell dir="ltr">{lead.phone}</TableCell>
                      <TableCell>{lead.profession || "-"}</TableCell>
                      <TableCell>{lead.familyMembers || "-"}</TableCell>
                      <TableCell>{lead.houseCategory || "-"}</TableCell>
                      <TableCell>{lead.houseNumber || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {leads.map((lead) => (
                <Card key={lead.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{lead.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                    <Phone className="h-3 w-3" />
                    <span dir="ltr">{lead.phone}</span>
                  </div>
                  
                  {lead.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      {lead.address}
                    </div>
                  )}
                  
                  {lead.profession && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <Briefcase className="h-3 w-3" />
                      {lead.profession}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {lead.familyMembers && (
                      <div>أفراد الأسرة: {lead.familyMembers}</div>
                    )}
                    {lead.houseCategory && (
                      <div>فئة الدار: {lead.houseCategory}</div>
                    )}
                    {lead.houseNumber && (
                      <div className="flex items-center gap-1">
                        <Home className="h-3 w-3" />
                        {lead.houseNumber}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
