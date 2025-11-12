import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Upload, Folder, Grid3x3 } from "lucide-react";

const Media = () => {
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
