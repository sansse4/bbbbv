import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const saleSchema = z.object({
  sales_agent: z.string().min(1, "اسم موظف المبيعات مطلوب"),
  customer_name: z.string().min(1, "اسم الزبون مطلوب"),
  mobile: z.string().min(1, "رقم الموبايل مطلوب"),
  location: z.string().min(1, "المحافظة / منطقة السكن مطلوبة"),
  source: z.string().min(1, "كيف تعرّف على المشروع مطلوب"),
  source_other: z.string().optional(),
  block_number: z.string().min(1, "رقم البلوك مطلوب"),
  house_number: z.string().min(1, "رقم البيت مطلوب"),
  payment_method: z.string().min(1, "طريقة الدفع مطلوبة"),
  paid_amount: z.coerce.number().min(0, "المبلغ المدفوع يجب أن يكون صفر أو أكبر"),
  remaining_amount: z.coerce.number().min(0, "المبلغ المتبقي يجب أن يكون صفر أو أكبر"),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface SalesFormProps {
  onSaleAdded?: (sale: SaleFormData & { timestamp: string }) => void;
}

const sourceOptions = [
  { value: "facebook", label: "فيسبوك" },
  { value: "instagram", label: "إنستغرام" },
  { value: "tiktok", label: "تيك توك" },
  { value: "whatsapp", label: "واتساب" },
  { value: "friend", label: "صديق / معارف" },
  { value: "street_sign", label: "لوحة شارع" },
  { value: "real_estate_office", label: "مكتب عقاري" },
  { value: "other", label: "أخرى" },
];

const paymentMethodOptions = [
  { value: "cash", label: "كاش" },
  { value: "bank_transfer", label: "تحويل بنكي" },
  { value: "check", label: "صك" },
  { value: "installment", label: "تقسيط" },
  { value: "other", label: "أخرى" },
];

export const SalesForm = ({ onSaleAdded }: SalesFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSourceOther, setShowSourceOther] = useState(false);

  const form = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      sales_agent: "",
      customer_name: "",
      mobile: "",
      location: "",
      source: "",
      source_other: "",
      block_number: "",
      house_number: "",
      payment_method: "",
      paid_amount: 0,
      remaining_amount: 0,
    },
  });

  const onSubmit = async (data: SaleFormData) => {
    setIsSubmitting(true);
    
    try {
      const timestamp = new Date().toISOString();
      const sourceValue = data.source === "other" && data.source_other 
        ? data.source_other 
        : sourceOptions.find(opt => opt.value === data.source)?.label || data.source;

      const paymentMethodLabel = paymentMethodOptions.find(
        opt => opt.value === data.payment_method
      )?.label || data.payment_method;

      const params = new URLSearchParams({
        sales_agent: data.sales_agent,
        customer_name: data.customer_name,
        mobile: data.mobile,
        location: data.location,
        source: sourceValue,
        block_number: data.block_number,
        house_number: data.house_number,
        payment_method: paymentMethodLabel,
        paid_amount: data.paid_amount.toString(),
        remaining_amount: data.remaining_amount.toString(),
        timestamp: timestamp,
      });

      const url = `https://script.google.com/macros/s/AKfycbx0yXd4e9AbDypsBVIQIk-P7iXO9NYNgKoBZB0_hVn6eg19iRptKbSK6GmhlRGnUKfWJA/exec?${params.toString()}`;

      const response = await fetch(url, {
        method: "GET",
        mode: "no-cors",
      });

      toast({
        title: "تم حفظ عملية البيع بنجاح",
        description: "تم تسجيل البيانات في النظام",
      });

      if (onSaleAdded) {
        onSaleAdded({ ...data, timestamp });
      }

      form.reset();
      setShowSourceOther(false);
      
      setTimeout(() => {
        document.getElementById("customer_name")?.focus();
      }, 100);
    } catch (error) {
      console.error("Error submitting sale:", error);
      toast({
        title: "فشل الحفظ",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">تسجيل عملية بيع / دفع جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sales_agent">اسم موظف المبيعات *</Label>
            <Input
              id="sales_agent"
              {...form.register("sales_agent")}
              placeholder="أدخل اسم موظف المبيعات"
            />
            {form.formState.errors.sales_agent && (
              <p className="text-sm text-destructive">{form.formState.errors.sales_agent.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name">اسم الزبون *</Label>
            <Input
              id="customer_name"
              {...form.register("customer_name")}
              placeholder="أدخل اسم الزبون"
            />
            {form.formState.errors.customer_name && (
              <p className="text-sm text-destructive">{form.formState.errors.customer_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">رقم الموبايل *</Label>
            <Input
              id="mobile"
              {...form.register("mobile")}
              placeholder="07XX XXX XXXX"
              dir="ltr"
            />
            {form.formState.errors.mobile && (
              <p className="text-sm text-destructive">{form.formState.errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">المحافظة / منطقة السكن *</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="المحافظة / المنطقة"
            />
            {form.formState.errors.location && (
              <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">كيف تعرّف على المشروع *</Label>
            <Select
              value={form.watch("source")}
              onValueChange={(value) => {
                form.setValue("source", value);
                setShowSourceOther(value === "other");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المصدر" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.source && (
              <p className="text-sm text-destructive">{form.formState.errors.source.message}</p>
            )}
          </div>

          {showSourceOther && (
            <div className="space-y-2">
              <Label htmlFor="source_other">تفاصيل المصدر</Label>
              <Input
                id="source_other"
                {...form.register("source_other")}
                placeholder="أدخل تفاصيل المصدر"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="block_number">رقم البلوك *</Label>
              <Input
                id="block_number"
                {...form.register("block_number")}
                placeholder="مثال: 5"
                dir="ltr"
              />
              {form.formState.errors.block_number && (
                <p className="text-sm text-destructive">{form.formState.errors.block_number.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="house_number">رقم البيت *</Label>
              <Input
                id="house_number"
                {...form.register("house_number")}
                placeholder="مثال: 12"
                dir="ltr"
              />
              {form.formState.errors.house_number && (
                <p className="text-sm text-destructive">{form.formState.errors.house_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">طريقة الدفع *</Label>
            <Select
              value={form.watch("payment_method")}
              onValueChange={(value) => form.setValue("payment_method", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.payment_method && (
              <p className="text-sm text-destructive">{form.formState.errors.payment_method.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paid_amount">المبلغ المدفوع (IQD) *</Label>
              <Input
                id="paid_amount"
                type="number"
                {...form.register("paid_amount")}
                placeholder="0"
                dir="ltr"
              />
              {form.formState.errors.paid_amount && (
                <p className="text-sm text-destructive">{form.formState.errors.paid_amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining_amount">المبلغ المتبقي (IQD) *</Label>
              <Input
                id="remaining_amount"
                type="number"
                {...form.register("remaining_amount")}
                placeholder="0"
                dir="ltr"
              />
              {form.formState.errors.remaining_amount && (
                <p className="text-sm text-destructive">{form.formState.errors.remaining_amount.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ العملية"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
