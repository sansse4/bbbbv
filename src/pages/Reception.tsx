import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxIDrDCDW3jJJvLNQ-yS1ZDFkBwYgy67pdDaw4GxNXOIahTkj9rxzodr2axHUgS1rmq/exec";

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.profession || !formData.family_members || !formData.house_category || !formData.house_number) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const params = new URLSearchParams({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        "المهنة": formData.profession,
        "عدد افراد الاسرة": formData.family_members,
        "فئة الدار": formData.house_category,
        "رقم الدار": formData.house_number,
        source: formData.source || "",
      });

      const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
        method: "GET",
        mode: "no-cors",
      });

      // no-cors mode doesn't allow reading the response, so we assume success
      toast({
        title: "Success",
        description: "Visitor checked in successfully",
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
      });
      
      setTimeout(() => {
        nameRef.current?.focus();
      }, 100);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send data, please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Visitor Check-In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                ref={nameRef}
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="City / Area"
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
                placeholder="Enter profession"
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
                placeholder="Enter number of family members"
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
                placeholder="Enter house category"
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
                placeholder="Enter house number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">How did you hear about the project?</Label>
              <Textarea
                id="source"
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                placeholder="Optional"
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
