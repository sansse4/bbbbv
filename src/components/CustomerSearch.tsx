import { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface CustomerInteraction {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const CustomerSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("يرجى إدخال اسم أو رقم هاتف للبحث");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("call_center_interactions")
        .select("*")
        .or(`customer_name.ilike.%${searchQuery}%,customer_phone.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setInteractions(data || []);
      
      if (!data || data.length === 0) {
        toast.info("لم يتم العثور على نتائج", {
          description: "لا توجد تفاعلات سابقة لهذا الزبون",
        });
      } else {
        toast.success(`تم العثور على ${data.length} تفاعل(ات)`);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("فشل البحث", {
        description: "حدث خطأ أثناء البحث، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مهتم جداً":
        return "bg-green-500 text-white";
      case "مهتم":
        return "bg-blue-500 text-white";
      case "متردد":
        return "bg-yellow-500 text-white";
      case "غير مهتم":
        return "bg-red-500 text-white";
      case "رقم خاطئ":
      case "لا يرد":
        return "bg-gray-500 text-white";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          البحث عن زبون
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? "جاري البحث..." : "بحث"}
          </Button>
        </div>

        {interactions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">
              التفاعلات السابقة ({interactions.length})
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{interaction.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{interaction.customer_phone}</p>
                    </div>
                    <Badge className={getStatusColor(interaction.status)}>
                      {interaction.status}
                    </Badge>
                  </div>
                  
                  {interaction.appointment_date && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">الموعد: </span>
                      {format(new Date(interaction.appointment_date), "yyyy-MM-dd")}
                      {interaction.appointment_time && ` - ${interaction.appointment_time}`}
                    </div>
                  )}
                  
                  {interaction.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">ملاحظات: </span>
                      {interaction.notes}
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(interaction.created_at), "yyyy-MM-dd HH:mm")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};