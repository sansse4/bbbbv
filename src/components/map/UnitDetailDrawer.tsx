import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UnitStatusBadge } from "./UnitStatusBadge";
import { Unit, UnitStatus, useUpdateUnit } from "@/hooks/useUnits";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Home, MapPin, Ruler, DollarSign, User, Phone, Briefcase, Calculator, FileText, Clock, Edit, Save, X, CheckCircle, ShoppingCart } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UnitDetailDrawerProps {
  unit: Unit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UnitDetailDrawer({ unit, open, onOpenChange }: UnitDetailDrawerProps) {
  const { role } = useAuth();
  const isAdmin = role?.role === "admin";
  const updateUnit = useUpdateUnit();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Unit>>({});

  useEffect(() => {
    if (unit) {
      setEditForm({
        price: unit.price,
        status: unit.status,
        buyer_name: unit.buyer_name || "",
        buyer_phone: unit.buyer_phone || "",
        sales_employee: unit.sales_employee || "",
        accountant_name: unit.accountant_name || "",
        notes: unit.notes || "",
      });
    }
    setIsEditing(false);
  }, [unit]);

  const handleSave = async () => {
    if (!unit) return;
    
    await updateUnit.mutateAsync({
      id: unit.id,
      ...editForm,
    });
    
    setIsEditing(false);
  };

  const handleQuickAction = async (newStatus: UnitStatus) => {
    if (!unit) return;
    
    await updateUnit.mutateAsync({
      id: unit.id,
      status: newStatus,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!unit) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-right">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Home className="h-5 w-5 text-primary" />
            وحدة رقم {unit.unit_number}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            البلوك {unit.block_number}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">الحالة</span>
            {isEditing ? (
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value as UnitStatus })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">متاح</SelectItem>
                  <SelectItem value="reserved">محجوز</SelectItem>
                  <SelectItem value="sold">مباع</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <UnitStatusBadge status={unit.status} />
            )}
          </div>

          <Separator />

          {/* Unit Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4" />
                المساحة
              </div>
              <p className="font-semibold">{unit.area_m2} م²</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                السعر
              </div>
              {isEditing ? (
                <Input
                  type="number"
                  value={editForm.price || ""}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="h-8"
                />
              ) : (
                <p className="font-semibold">{formatCurrency(unit.price)} د.ع</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Buyer Info - Only show to admin or if editing */}
          {(isAdmin || unit.buyer_name) && (
            <>
              <div className="space-y-4">
                <h4 className="font-semibold text-foreground">معلومات المشتري</h4>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      اسم المشتري
                    </Label>
                    {isEditing ? (
                      <Input
                        value={editForm.buyer_name || ""}
                        onChange={(e) => setEditForm({ ...editForm, buyer_name: e.target.value })}
                      />
                    ) : (
                      <p className="font-medium">{unit.buyer_name || "—"}</p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        رقم الهاتف
                      </Label>
                      {isEditing ? (
                        <Input
                          value={editForm.buyer_phone || ""}
                          onChange={(e) => setEditForm({ ...editForm, buyer_phone: e.target.value })}
                          dir="ltr"
                        />
                      ) : (
                        <p className="font-medium" dir="ltr">{unit.buyer_phone || "—"}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          {/* Staff Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">الموظفين المسؤولين</h4>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  موظف المبيعات
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.sales_employee || ""}
                    onChange={(e) => setEditForm({ ...editForm, sales_employee: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{unit.sales_employee || "—"}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calculator className="h-4 w-4" />
                  المحاسب
                </Label>
                {isEditing ? (
                  <Input
                    value={editForm.accountant_name || ""}
                    onChange={(e) => setEditForm({ ...editForm, accountant_name: e.target.value })}
                  />
                ) : (
                  <p className="font-medium">{unit.accountant_name || "—"}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              ملاحظات
            </Label>
            {isEditing ? (
              <Textarea
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            ) : (
              <p className="text-sm">{unit.notes || "لا توجد ملاحظات"}</p>
            )}
          </div>

          {/* Last Updated */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            آخر تحديث: {format(new Date(unit.updated_at), "PPpp", { locale: ar })}
          </div>

          {/* Admin Actions */}
          {isAdmin && (
            <>
              <Separator />
              
              <div className="space-y-3">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={updateUnit.isPending} className="flex-1">
                      <Save className="h-4 w-4 ml-2" />
                      حفظ
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                      <X className="h-4 w-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل البيانات
                  </Button>
                )}

                {!isEditing && unit.status === "available" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAction("reserved")}
                      disabled={updateUnit.isPending}
                      className="flex-1 border-amber-500 text-amber-600 hover:bg-amber-50"
                    >
                      <CheckCircle className="h-4 w-4 ml-2" />
                      حجز
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAction("sold")}
                      disabled={updateUnit.isPending}
                      className="flex-1 border-rose-500 text-rose-600 hover:bg-rose-50"
                    >
                      <ShoppingCart className="h-4 w-4 ml-2" />
                      بيع
                    </Button>
                  </div>
                )}

                {!isEditing && unit.status === "reserved" && (
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction("sold")}
                    disabled={updateUnit.isPending}
                    className="w-full border-rose-500 text-rose-600 hover:bg-rose-50"
                  >
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    تحويل إلى مباع
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
