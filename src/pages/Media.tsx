import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Image, Upload, Folder, Grid3x3 } from "lucide-react";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Media = () => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    customerStatus: "",
    booking: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.customerStatus || !formData.booking) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("الاسم", formData.name);
      formDataToSend.append("رقم الهاتف", formData.phone);
      formDataToSend.append("حالة الزبون", formData.customerStatus || "");
      formDataToSend.append("حجز موعد", formData.booking || "");
      formDataToSend.append("ملاحظات", formData.notes || "");
      formDataToSend.append("اسم الموضف", profile?.full_name || "");
      formDataToSend.append("حالة التصال", "لم يتم الرد");

      console.log("Sending data to Google Sheet...");

      await fetch(
        "https://script.google.com/macros/s/AKfycbxMor9nLf1Ei2lazJqMzYR3MyBg6msZg8H5hn_9KkRdiE2d2lk4_gOX3WXaOTpSNGwF/exec",
        { 
          method: "POST",
          body: formDataToSend,
          mode: 'no-cors'
        }
      );

      // With no-cors mode, we can't check response.ok, so we assume success if no error thrown
      toast({
        title: "نجح",
        description: "تم الحفظ بنجاح",
      });

      setFormData({
        name: "",
        phone: "",
        customerStatus: "",
        booking: "",
        notes: "",
      });

      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل الإرسال، حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mediaItems = [
    { id: 1, type: "image", name: "Property Exterior", category: "Residential" },
    { id: 2, type: "image", name: "Interior Living Room", category: "Residential" },
    { id: 3, type: "image", name: "Commercial Building", category: "Commercial" },
    { id: 4, type: "image", name: "Office Space", category: "Commercial" },
    { id: 5, type: "image", name: "Luxury Apartment", category: "Residential" },
    { id: 6, type: "image", name: "Warehouse", category: "Industrial" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تسجيل الميديا</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  dir="rtl"
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
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerStatus">
                  حالة الزبون <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.customerStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerStatus: value })
                  }
                >
                  <SelectTrigger id="customerStatus" dir="rtl">
                    <SelectValue placeholder="اختر حالة العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مهتم">مهتم</SelectItem>
                    <SelectItem value="غير مهتم">غير مهتم</SelectItem>
                    <SelectItem value="يحتاج متابعة">يحتاج متابعة</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking">
                حجز موعد <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.booking}
                onValueChange={(value) =>
                  setFormData({ ...formData, booking: value })
                }
              >
                <SelectTrigger id="booking" dir="rtl">
                  <SelectValue placeholder="اختر حالة الحجز" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نعم">نعم</SelectItem>
                  <SelectItem value="لا">لا</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Input
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="أدخل ملاحظات إضافية"
                dir="rtl"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Manage property images and marketing materials
          </p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Media
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="gap-2">
          <Grid3x3 className="h-4 w-4" />
          All Media
        </Button>
        <Button variant="outline" className="gap-2">
          <Folder className="h-4 w-4" />
          Residential
        </Button>
        <Button variant="outline" className="gap-2">
          <Folder className="h-4 w-4" />
          Commercial
        </Button>
        <Button variant="outline" className="gap-2">
          <Folder className="h-4 w-4" />
          Industrial
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaItems.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Image className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Media;
