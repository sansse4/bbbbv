import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Home, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import sitePlanImage from "@/assets/site-plan.png";

interface Block {
  id: string;
  name: string;
  description: string;
  unitsCount: number;
  availableUnits: number;
  typicalArea: string;
  position: { top: string; left: string; width: string; height: string };
}

const blocks: Block[] = [
  {
    id: "block-1",
    name: "BLOCK 1",
    description: "Main entrance block, close to the main road.",
    unitsCount: 40,
    availableUnits: 25,
    typicalArea: "200–220 m²",
    position: { top: "10%", left: "5%", width: "12%", height: "15%" },
  },
  {
    id: "block-2",
    name: "BLOCK 2",
    description: "Family-oriented block with internal streets.",
    unitsCount: 60,
    availableUnits: 32,
    typicalArea: "180–200 m²",
    position: { top: "10%", left: "20%", width: "12%", height: "15%" },
  },
  {
    id: "block-3",
    name: "BLOCK 3",
    description: "Premium location near community amenities.",
    unitsCount: 50,
    availableUnits: 18,
    typicalArea: "220–250 m²",
    position: { top: "10%", left: "35%", width: "12%", height: "15%" },
  },
  {
    id: "block-4",
    name: "BLOCK 4",
    description: "Quiet residential area with parks nearby.",
    unitsCount: 45,
    availableUnits: 22,
    typicalArea: "190–210 m²",
    position: { top: "10%", left: "50%", width: "12%", height: "15%" },
  },
  {
    id: "block-5",
    name: "BLOCK 5",
    description: "Corner block with excellent accessibility.",
    unitsCount: 55,
    availableUnits: 30,
    typicalArea: "200–230 m²",
    position: { top: "10%", left: "65%", width: "12%", height: "15%" },
  },
  {
    id: "block-6",
    name: "BLOCK 6",
    description: "Central location close to shopping area.",
    unitsCount: 48,
    availableUnits: 15,
    typicalArea: "185–205 m²",
    position: { top: "10%", left: "80%", width: "12%", height: "15%" },
  },
  {
    id: "block-7",
    name: "BLOCK 7",
    description: "Spacious plots with garden areas.",
    unitsCount: 42,
    availableUnits: 28,
    typicalArea: "210–240 m²",
    position: { top: "30%", left: "5%", width: "12%", height: "15%" },
  },
  {
    id: "block-8",
    name: "BLOCK 8",
    description: "Modern design with wide streets.",
    unitsCount: 52,
    availableUnits: 20,
    typicalArea: "195–215 m²",
    position: { top: "30%", left: "20%", width: "12%", height: "15%" },
  },
  {
    id: "block-9",
    name: "BLOCK 9",
    description: "Family-friendly with playgrounds.",
    unitsCount: 58,
    availableUnits: 35,
    typicalArea: "180–200 m²",
    position: { top: "30%", left: "35%", width: "12%", height: "15%" },
  },
  {
    id: "block-10",
    name: "BLOCK 10",
    description: "Well-connected to main roads.",
    unitsCount: 46,
    availableUnits: 19,
    typicalArea: "200–220 m²",
    position: { top: "30%", left: "50%", width: "12%", height: "15%" },
  },
  {
    id: "block-11",
    name: "BLOCK 11",
    description: "Peaceful area with green spaces.",
    unitsCount: 44,
    availableUnits: 26,
    typicalArea: "190–210 m²",
    position: { top: "30%", left: "65%", width: "12%", height: "15%" },
  },
  {
    id: "block-12",
    name: "BLOCK 12",
    description: "Prime location near schools.",
    unitsCount: 50,
    availableUnits: 12,
    typicalArea: "205–225 m²",
    position: { top: "30%", left: "80%", width: "12%", height: "15%" },
  },
  {
    id: "block-13",
    name: "BLOCK 13",
    description: "Excellent value with good amenities.",
    unitsCount: 54,
    availableUnits: 31,
    typicalArea: "185–205 m²",
    position: { top: "50%", left: "5%", width: "12%", height: "15%" },
  },
  {
    id: "block-14",
    name: "BLOCK 14",
    description: "Spacious units with modern facilities.",
    unitsCount: 47,
    availableUnits: 24,
    typicalArea: "210–230 m²",
    position: { top: "50%", left: "20%", width: "12%", height: "15%" },
  },
  {
    id: "block-15",
    name: "BLOCK 15",
    description: "Well-planned with optimal orientation.",
    unitsCount: 51,
    availableUnits: 17,
    typicalArea: "195–215 m²",
    position: { top: "50%", left: "35%", width: "12%", height: "15%" },
  },
  {
    id: "block-16",
    name: "BLOCK 16",
    description: "Close to community center.",
    unitsCount: 49,
    availableUnits: 29,
    typicalArea: "200–220 m²",
    position: { top: "50%", left: "50%", width: "12%", height: "15%" },
  },
  {
    id: "block-17",
    name: "BLOCK 17",
    description: "Quiet corner with privacy.",
    unitsCount: 43,
    availableUnits: 21,
    typicalArea: "190–210 m²",
    position: { top: "50%", left: "65%", width: "12%", height: "15%" },
  },
  {
    id: "block-18",
    name: "BLOCK 18",
    description: "Easy access to main gate.",
    unitsCount: 56,
    availableUnits: 33,
    typicalArea: "180–200 m²",
    position: { top: "50%", left: "80%", width: "12%", height: "15%" },
  },
  {
    id: "block-19",
    name: "BLOCK 19",
    description: "Large plots with extra space.",
    unitsCount: 38,
    availableUnits: 16,
    typicalArea: "220–250 m²",
    position: { top: "70%", left: "15%", width: "12%", height: "15%" },
  },
  {
    id: "block-20",
    name: "BLOCK 20",
    description: "Modern infrastructure and utilities.",
    unitsCount: 53,
    availableUnits: 27,
    typicalArea: "195–215 m²",
    position: { top: "70%", left: "35%", width: "12%", height: "15%" },
  },
  {
    id: "block-21",
    name: "BLOCK 21",
    description: "Premium corner units available.",
    unitsCount: 41,
    availableUnits: 14,
    typicalArea: "205–235 m²",
    position: { top: "70%", left: "65%", width: "12%", height: "15%" },
  },
];

export function InteractiveSitePlan() {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Home className="h-6 w-6 text-primary" />
          Interactive Site Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container - Takes 2/3 of the space */}
          <div className="relative w-full lg:col-span-2">
            <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border">
              {/* Site plan image */}
              <img 
                src={sitePlanImage} 
                alt="Interactive Site Plan" 
                className="w-full h-full object-contain"
              />

              {/* Block Hotspots */}
              {blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  onMouseEnter={() => setHoveredBlock(block.id)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  className={cn(
                    "absolute cursor-pointer transition-all duration-200",
                    "hover:bg-primary/20 hover:border-2 hover:border-primary",
                    selectedBlock?.id === block.id && "bg-primary/30 border-2 border-primary",
                    hoveredBlock === block.id && "z-10"
                  )}
                  style={{
                    top: block.position.top,
                    left: block.position.left,
                    width: block.position.width,
                    height: block.position.height,
                  }}
                  aria-label={`Select ${block.name}`}
                >
                  {/* Block label on hover */}
                  {hoveredBlock === block.id && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground bg-background/90 border border-primary rounded">
                      {block.name}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Instructions */}
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Hover over blocks and click to see details
            </p>
          </div>

          {/* Info Panel - Takes 1/3 of the space */}
          <div className="flex flex-col lg:col-span-1">
            {selectedBlock ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {selectedBlock.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedBlock.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Units</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {selectedBlock.unitsCount}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-4 w-4 text-success" />
                      <span className="text-sm text-muted-foreground">Available</span>
                    </div>
                    <p className="text-2xl font-bold text-success">
                      {selectedBlock.availableUnits}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center gap-2 mb-1">
                    <Ruler className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Typical Area</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {selectedBlock.typicalArea}
                  </p>
                </div>

                <Button className="w-full mt-4" size="lg">
                  <Phone className="h-4 w-4 mr-2" />
                  Request a Call About This Block
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <Home className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground">
                    Hover over a block and click to see its details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
