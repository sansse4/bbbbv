import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "sonner";
import { Phone, PhoneMissed, PhoneOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const EXPORT_SHEET_URL = "https://script.google.com/macros/s/AKfycby1RqRPQEywm8xjVrIusIMF1Z7Ki8HC9PTn_DHxiOiUExVBHS79_cAASvSm5_Au_v0/exec";

const callStatusSchema = z.object({
  callStatus: z.enum(["contacted", "no-answer", "wrong-number"]),
  customerStatus: z.string().min(1, "حالة الزبون مطلوبة"),
  appointment: z.string().min(1, "حجز الموعد مطلوب"),
  notes: z.string().optional(),
});

type CallStatusFormValues = z.infer<typeof callStatusSchema>;

interface CallStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callData: {
    name: string;
    phone: string;
    timestamp: string;
  };
  onStatusUpdate: (status: "contacted" | "no-answer" | "wrong-number") => void;
}

export const CallStatusDialog = ({
  open,
  onOpenChange,
  callData,
  onStatusUpdate,
}: CallStatusDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();

  const form = useForm<CallStatusFormValues>({
    resolver: zodResolver(callStatusSchema),
    defaultValues: {
      callStatus: "contacted",
      customerStatus: "",
      appointment: "",
      notes: "",
    },
  });

  const onSubmit = async (data: CallStatusFormValues) => {
    setIsSubmitting(true);

    try {
      const employeeName = profile?.full_name || "غير محدد";
      const callStatus = data.callStatus === "contacted" ? "تم الرد" : data.callStatus === "no-answer" ? "لم يتم الرد" : "رقم خطأ";
      
      // Build params in exact column order
      const params = new URLSearchParams();
      params.append("employee", employeeName);
      params.append("name", callData.name);
      params.append("call_status", callStatus);
      params.append("phone", callData.phone);
      params.append("booking", data.appointment);
      params.append("status", data.customerStatus);
      params.append("notes", data.notes || "");

      const response = await fetch(`${EXPORT_SHEET_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Network error");
      }

      toast.success("تم حفظ البيانات بنجاح");
      onStatusUpdate(data.callStatus);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting call status:", error);
      toast.error("فشل الحفظ، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusButton = (status: "contacted" | "no-answer" | "wrong-number", label: string, icon: any) => {
    const Icon = icon;
    const selected = form.watch("callStatus") === status;
    
    let colorClass = "";
    if (status === "contacted") colorClass = selected ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-success/20 hover:bg-success/30";
    if (status === "no-answer") colorClass = selected ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-destructive/20 hover:bg-destructive/30";
    if (status === "wrong-number") colorClass = selected ? "bg-muted hover:bg-muted/90 text-muted-foreground" : "bg-muted/20 hover:bg-muted/30";

    return (
      <Button
        type="button"
        variant="outline"
        className={`flex-1 ${colorClass}`}
        onClick={() => form.setValue("callStatus", status)}
      >
        <Icon className="h-4 w-4 mr-2" />
        {label}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>تحديث حالة المكالمة</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          <p className="text-sm"><strong>الاسم:</strong> {callData.name}</p>
          <p className="text-sm"><strong>الرقم:</strong> {callData.phone}</p>
          <p className="text-sm text-muted-foreground">{callData.timestamp}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="callStatus"
              render={() => (
                <FormItem>
                  <FormLabel>حالة الاتصال</FormLabel>
                  <div className="flex gap-2">
                    {getStatusButton("contacted", "تم الاتصال", Phone)}
                    {getStatusButton("no-answer", "لم يتم الرد", PhoneMissed)}
                    {getStatusButton("wrong-number", "رقم خطأ", PhoneOff)}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الزبون</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
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

            <FormField
              control={form.control}
              name="appointment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حجز موعد</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="أي ملاحظة عن المكالمة"
                      className="resize-none min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
