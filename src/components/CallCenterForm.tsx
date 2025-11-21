import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";

const CALLCENTER_API_URL = "https://script.google.com/macros/s/AKfycbwhXyu0U4eBh-Wa0vknHWm2eY-9ldMEEcFXDmR7m3SHcgRYC1opiFuMEqRFhox7PMio/exec";

const callCenterFormSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب").regex(/^[\d+\s()-]+$/, "رقم الهاتف غير صحيح"),
  appointment: z.string().min(1, "حجز الموعد مطلوب"),
  status: z.string().min(1, "حالة الزبون مطلوبة"),
  notes: z.string().optional(),
});

type CallCenterFormValues = z.infer<typeof callCenterFormSchema>;

interface CallCenterFormProps {
  onCallAdded?: (call: CallCenterFormValues) => void;
}

export const CallCenterForm = ({ onCallAdded }: CallCenterFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CallCenterFormValues>({
    resolver: zodResolver(callCenterFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      appointment: "",
      status: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CallCenterFormValues) => {
    setIsSubmitting(true);

    try {
      const params = new URLSearchParams({
        name: data.name,
        phone: data.phone,
        appointment: data.appointment,
        status: data.status,
        notes: data.notes || "",
      });

      const response = await fetch(`${CALLCENTER_API_URL}?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      toast({
        title: "نجح الحفظ",
        description: "تم حفظ بيانات المكالمة بنجاح",
      });

      onCallAdded?.(data);
      form.reset();
      
      // Focus on phone field for next call
      setTimeout(() => {
        const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
        phoneInput?.focus();
      }, 100);
    } catch (error) {
      console.error("Error submitting call data:", error);
      toast({
        title: "فشل الحفظ",
        description: "فشل الحفظ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          تسجيل مكالمة جديدة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">الاسم</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="اسم الزبون"
                        {...field}
                        className="h-9"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">رقم الهاتف</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="07XXXXXXXXX"
                        {...field}
                        className="h-9"
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">حجز موعد</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="حجز موعد">حجز موعد</SelectItem>
                        <SelectItem value="لا يحتاج موعد">لا يحتاج موعد</SelectItem>
                        <SelectItem value="طلب معاودة اتصال">طلب معاودة اتصال</SelectItem>
                        <SelectItem value="تم الحضور سابقاً">تم الحضور سابقاً</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">حالة الوزبون</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="مهتم جداً">مهتم جداً</SelectItem>
                        <SelectItem value="مهتم">مهتم</SelectItem>
                        <SelectItem value="متردد">متردد</SelectItem>
                        <SelectItem value="غير مهتم">غير مهتم</SelectItem>
                        <SelectItem value="رقم خاطئ">رقم خاطئ</SelectItem>
                        <SelectItem value="لا يرد">لا يرد</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">ملاحضات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي ملاحظات إضافية عن الزبون أو المكالمة"
                      className="resize-none min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? "جاري الحفظ..." : "حفظ المكالمة"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
