import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Image, Upload, Folder, Grid3x3 } from "lucide-react";
import { useState, useRef } from "react";

const Media = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const params = new URLSearchParams({
        name: formData.name,
        phone: formData.phone,
        note: formData.note || "",
      });

      const response = await fetch(
        `https://script.google.com/macros/s/AKfycbwZHXewTjf7S5uXYT8whn1naGQ--v4dzsHOZBkQ_KsXMG6NuGrkZoMBMLHuPPq86raPgg/exec?${params}`
      );

      if (response.ok) {
        toast({
          title: "نجح",
          description: "تم الحفظ بنجاح",
        });

        setFormData({
          name: "",
          phone: "",
          note: "",
        });

        setTimeout(() => {
          nameRef.current?.focus();
        }, 100);
      } else {
        throw new Error("Failed to save");
      }
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
                <Label htmlFor="note">ملاحظات</Label>
                <Select
                  value={formData.note}
                  onValueChange={(value) =>
                    setFormData({ ...formData, note: value })
                  }
                >
                  <SelectTrigger id="note" dir="rtl">
                    <SelectValue placeholder="اختر حالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مهتم">مهتم</SelectItem>
                    <SelectItem value="غير مهتم">غير مهتم</SelectItem>
                    <SelectItem value="يحتاج متابعة">يحتاج متابعة</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
