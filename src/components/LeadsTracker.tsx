import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useImportedSales, ImportedSale } from "@/hooks/useImportedSales";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Phone, Home, RefreshCw, MapPin, Briefcase, CheckCircle, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyPDTduwNrbtRiO7yKt7PAo76q_xdkKNDdZyJK6a4Xxy_67bVGc8B3qzIDGHenSWNrq/exec";

export const LeadsTracker = () => {
  const { sales: leads, isLoading, error, refetch } = useImportedSales();
  const { profile } = useAuth();
  const [receivedLeads, setReceivedLeads] = useState<Set<string>>(new Set());
  const [updatingPhone, setUpdatingPhone] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<ImportedSale | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    profession: "",
    familyMembers: "",
    houseCategory: "",
    houseNumber: "",
    notes: "",
    customerStatus: "",
    employeeName: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load received status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("receivedLeads");
    if (saved) {
      setReceivedLeads(new Set(JSON.parse(saved)));
    }
  }, []);

  // Open edit dialog - auto set status to "تم الاستلام" and employee name
  const openEditDialog = (lead: ImportedSale) => {
    const employeeName = profile?.full_name || "";
    setSelectedLead(lead);
    setEditForm({
      name: lead.name,
      phone: lead.phone,
      address: lead.address || "",
      profession: lead.profession || "",
      familyMembers: lead.familyMembers || "",
      houseCategory: lead.houseCategory || "",
      houseNumber: lead.houseNumber || "",
      notes: "",
      customerStatus: "تم الاستلام",
      employeeName: employeeName,
    });
  };

  // Save changes to Google Sheet
  const saveChanges = async () => {
    if (!selectedLead) return;
    
    setIsSaving(true);
    
    try {
      const params = new URLSearchParams({
        action: "update",
        "رقم الهاتف": selectedLead.phone,
        "الاسم": editForm.name,
        "العنوان": editForm.address,
        "المهنة": editForm.profession,
        "عدد افراد الاسرة": editForm.familyMembers,
        "فئة الدار": editForm.houseCategory,
        "رقم الدار": editForm.houseNumber,
        "ملاحضات": editForm.notes,
        "حالة الزبون": editForm.customerStatus || "تم الاستلام",
        "اسم الموظف": editForm.employeeName,
      });

      await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "no-cors",
      });

      // Update local received status
      if (editForm.customerStatus === "تم الاستلام") {
        const newReceived = new Set(receivedLeads);
        newReceived.add(selectedLead.phone);
        setReceivedLeads(newReceived);
        localStorage.setItem("receivedLeads", JSON.stringify([...newReceived]));
      }

      toast.success("تم حفظ التغييرات بنجاح");
      setSelectedLead(null);
      refetch();
    } catch (err) {
      console.error("Error saving changes:", err);
      toast.error("فشل حفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  // Quick mark as received
  const markAsReceived = async (leadPhone: string) => {
    setUpdatingPhone(leadPhone);
    const employeeName = profile?.full_name || "";
    
    try {
      const params = new URLSearchParams({
        action: "update",
        "رقم الهاتف": leadPhone,
        "حالة الزبون": "تم الاستلام",
        "اسم الموظف": employeeName,
      });

      await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "no-cors",
      });

      const newReceived = new Set(receivedLeads);
      newReceived.add(leadPhone);
      setReceivedLeads(newReceived);
      localStorage.setItem("receivedLeads", JSON.stringify([...newReceived]));
      
      toast.success("تم تحديث حالة الزبون بنجاح");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("فشل تحديث حالة الزبون");
    } finally {
      setUpdatingPhone(null);
    }
  };

  const isReceived = (leadPhone: string) => receivedLeads.has(leadPhone);

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
    <>
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
                      <TableHead>حالة الزبون</TableHead>
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
                        <TableCell>
                          {isReceived(lead.phone) ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="px-2 py-1 h-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                              onClick={() => openEditDialog(lead)}
                            >
                              <CheckCircle className="h-3 w-3 ml-1" />
                              تم الاستلام
                              <Edit className="h-3 w-3 mr-1" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-950"
                              onClick={() => openEditDialog(lead)}
                              disabled={updatingPhone === lead.phone}
                            >
                              {updatingPhone === lead.phone ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  انقر للتعديل
                                  <Edit className="h-3 w-3 mr-1" />
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
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
                    <div className="mt-2">
                      {isReceived(lead.phone) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 h-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800"
                          onClick={() => openEditDialog(lead)}
                        >
                          <CheckCircle className="h-3 w-3 ml-1" />
                          تم الاستلام
                          <Edit className="h-3 w-3 mr-1" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 px-2 text-orange-600 border-orange-300 hover:bg-orange-50 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-950"
                          onClick={() => openEditDialog(lead)}
                          disabled={updatingPhone === lead.phone}
                        >
                          {updatingPhone === lead.phone ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              انقر للتعديل
                              <Edit className="h-3 w-3 mr-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل معلومات الزبون</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">الاسم</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">رقم الهاتف</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                dir="ltr"
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">العنوان</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-profession">المهنة</Label>
              <Input
                id="edit-profession"
                value={editForm.profession}
                onChange={(e) => setEditForm({ ...editForm, profession: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-familyMembers">عدد أفراد الأسرة</Label>
                <Input
                  id="edit-familyMembers"
                  type="number"
                  value={editForm.familyMembers}
                  onChange={(e) => setEditForm({ ...editForm, familyMembers: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-houseCategory">فئة الدار</Label>
                <Input
                  id="edit-houseCategory"
                  value={editForm.houseCategory}
                  onChange={(e) => setEditForm({ ...editForm, houseCategory: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-houseNumber">رقم الدار</Label>
              <Input
                id="edit-houseNumber"
                value={editForm.houseNumber}
                onChange={(e) => setEditForm({ ...editForm, houseNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-customerStatus">حالة الزبون</Label>
              <Input
                id="edit-customerStatus"
                value={editForm.customerStatus}
                onChange={(e) => setEditForm({ ...editForm, customerStatus: e.target.value })}
                placeholder="تم الاستلام"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">ملاحظات</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="أضف ملاحظاتك هنا..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedLead(null)}>
              إلغاء
            </Button>
            <Button onClick={saveChanges} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};