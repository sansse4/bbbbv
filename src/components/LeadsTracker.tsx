import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useImportedSales, ImportedSale } from "@/hooks/useImportedSales";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Phone, Home, RefreshCw, MapPin, Briefcase, CheckCircle, Loader2, Edit, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8PkmPH44CUvyaRdSne88de834CGKVlDDS9us34uLudfFV4itSMu4eLuKtvo0BmNgd/exec";

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
      // Use FormData with POST for better compatibility with Google Apps Script
      const formData = new FormData();
      formData.append("action", "update");
      formData.append("رقم الهاتف", selectedLead.phone);
      formData.append("الاسم", editForm.name);
      formData.append("العنوان", editForm.address);
      formData.append("المهنة", editForm.profession);
      formData.append("عدد افراد الاسرة", editForm.familyMembers);
      formData.append("فئة الدار", editForm.houseCategory);
      formData.append("رقم الدار", editForm.houseNumber);
      formData.append("ملاحضات", editForm.notes);
      formData.append("حالة الزبون", editForm.customerStatus || "تم الاستلام");
      formData.append("موضف المبيعات", editForm.employeeName);

      console.log("Sending update to Google Sheet:", {
        phone: selectedLead.phone,
        customerStatus: editForm.customerStatus,
        notes: editForm.notes,
        employeeName: editForm.employeeName,
      });

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formData,
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
      const formData = new FormData();
      formData.append("action", "update");
      formData.append("رقم الهاتف", leadPhone);
      formData.append("حالة الزبون", "تم الاستلام");
      formData.append("موضف المبيعات", employeeName);

      console.log("Quick update to Google Sheet:", {
        phone: leadPhone,
        customerStatus: "تم الاستلام",
        employeeName: employeeName,
      });

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: formData,
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
            <Accordion type="single" collapsible className="w-full space-y-2">
              {leads.map((lead) => (
                <AccordionItem 
                  key={lead.id} 
                  value={lead.id}
                  className="border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full ml-4">
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-semibold text-foreground">{lead.name}</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span dir="ltr">{lead.phone}</span>
                          </div>
                        </div>
                      </div>
                      {isReceived(lead.phone) ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md">
                          <CheckCircle className="h-3 w-3 ml-1" />
                          تم الاستلام
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950 rounded-md border border-orange-300 dark:border-orange-600">
                          قيد الانتظار
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-4">
                      {/* Lead Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                        {lead.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">العنوان</p>
                              <p className="font-medium">{lead.address}</p>
                            </div>
                          </div>
                        )}
                        {lead.profession && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">المهنة</p>
                              <p className="font-medium">{lead.profession}</p>
                            </div>
                          </div>
                        )}
                        {lead.familyMembers && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">عدد أفراد الأسرة</p>
                              <p className="font-medium">{lead.familyMembers}</p>
                            </div>
                          </div>
                        )}
                        {lead.houseCategory && (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">فئة الدار</p>
                              <p className="font-medium">{lead.houseCategory}</p>
                            </div>
                          </div>
                        )}
                        {lead.houseNumber && (
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">رقم الدار</p>
                              <p className="font-medium">{lead.houseNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(lead);
                          }}
                        >
                          <Edit className="h-4 w-4 ml-2" />
                          تعديل البيانات
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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