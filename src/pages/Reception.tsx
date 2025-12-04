import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7Hyc7b4OC2P3y8EjCqK8z_DHcJb22NidQq-VNXB_oyXgoIVJwIR55GTslitHodd84/exec";

interface SalesEmployee {
  id: string;
  full_name: string;
}

export default function Reception() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    profession: "",
    family_members: "",
    house_category: "",
    house_number: "",
    source: "",
    assigned_to: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [salesEmployees, setSalesEmployees] = useState<SalesEmployee[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();
  const nameRef = useRef<HTMLInputElement>(null);

  // Fetch sales employees
  useEffect(() => {
    const fetchSalesEmployees = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("department", "Sales");

      if (error) {
        console.error("Error fetching sales employees:", error);
        return;
      }

      setSalesEmployees(data || []);
    };

    fetchSalesEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.profession || !formData.family_members || !formData.house_category || !formData.house_number || !formData.assigned_to) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة بما في ذلك اختيار موظف المبيعات",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the selected sales employee name
      const selectedEmployee = salesEmployees.find(emp => emp.id === formData.assigned_to);

      // Send to Google Sheets
      const params = new URLSearchParams({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        "المهنة": formData.profession,
        "عدد افراد الاسرة": formData.family_members,
        "فئة الدار": formData.house_category,
        "رقم الدار": formData.house_number,
        source: formData.source || "",
        "موظف المبيعات": selectedEmployee?.full_name || "",
      });

      await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "no-cors",
      });

      // Insert lead into database
      const { error: leadError } = await supabase.from("leads").insert({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        profession: formData.profession,
        family_members: parseInt(formData.family_members),
        house_category: formData.house_category,
        house_number: formData.house_number,
        source: formData.source || null,
        assigned_to: formData.assigned_to,
        created_by: user?.id,
        status: "pending",
      });

      if (leadError) {
        console.error("Error inserting lead:", leadError);
        // Still show success since Google Sheets was updated
      }

      // Create notification for the sales employee
      const { error: notificationError } = await supabase.from("notifications").insert({
        user_id: formData.assigned_to,
        title: "عميل جديد",
        message: `تم تحويل عميل جديد إليك: ${formData.name} - ${formData.phone}`,
        type: "lead",
      });

      if (notificationError) {
        console.error("Error creating notification:", notificationError);
      }

      toast({
        title: "تم بنجاح",
        description: `تم تسجيل الزائر وإرسال البيانات إلى ${selectedEmployee?.full_name}`,
      });

      // Clear form and focus back to first field
      setFormData({
        name: "",
        phone: "",
        address: "",
        profession: "",
        family_members: "",
        house_category: "",
        house_number: "",
        source: "",
        assigned_to: "",
      });
      
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال البيانات، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>تسجيل الزوار</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                الاسم <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                ref={nameRef}
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="أدخل الاسم"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                رقم الهاتف <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="أدخل رقم الهاتف"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                العنوان <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="المدينة / المنطقة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profession">
                المهنة <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profession"
                type="text"
                value={formData.profession}
                onChange={(e) =>
                  setFormData({ ...formData, profession: e.target.value })
                }
                placeholder="أدخل المهنة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="family_members">
                عدد افراد الاسرة <span className="text-destructive">*</span>
              </Label>
              <Input
                id="family_members"
                type="number"
                value={formData.family_members}
                onChange={(e) =>
                  setFormData({ ...formData, family_members: e.target.value })
                }
                placeholder="أدخل عدد أفراد الأسرة"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="house_category">
                فئة الدار <span className="text-destructive">*</span>
              </Label>
              <Input
                id="house_category"
                type="text"
                value={formData.house_category}
                onChange={(e) =>
                  setFormData({ ...formData, house_category: e.target.value })
                }
                placeholder="أدخل فئة الدار"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="house_number">
                رقم الدار <span className="text-destructive">*</span>
              </Label>
              <Input
                id="house_number"
                type="text"
                value={formData.house_number}
                onChange={(e) =>
                  setFormData({ ...formData, house_number: e.target.value })
                }
                placeholder="أدخل رقم الدار"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">
                موظف المبيعات <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.assigned_to}
                onValueChange={(value) =>
                  setFormData({ ...formData, assigned_to: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر موظف المبيعات" />
                </SelectTrigger>
                <SelectContent>
                  {salesEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">كيف سمعت عن المشروع؟</Label>
              <Textarea
                id="source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="اختياري"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
