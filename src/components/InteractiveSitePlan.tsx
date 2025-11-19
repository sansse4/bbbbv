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
  position: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
}
const blocks: Block[] = [{
  id: "block-1",
  name: "BLOCK 1",
  description: "Main entrance block, close to the main road.",
  unitsCount: 40,
  availableUnits: 25,
  typicalArea: "200–220 m²",
  position: {
    top: "10%",
    left: "5%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-2",
  name: "BLOCK 2",
  description: "Family-oriented block with internal streets.",
  unitsCount: 60,
  availableUnits: 32,
  typicalArea: "180–200 m²",
  position: {
    top: "10%",
    left: "20%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-3",
  name: "BLOCK 3",
  description: "Premium location near community amenities.",
  unitsCount: 50,
  availableUnits: 18,
  typicalArea: "220–250 m²",
  position: {
    top: "10%",
    left: "35%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-4",
  name: "BLOCK 4",
  description: "Quiet residential area with parks nearby.",
  unitsCount: 45,
  availableUnits: 22,
  typicalArea: "190–210 m²",
  position: {
    top: "10%",
    left: "50%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-5",
  name: "BLOCK 5",
  description: "Corner block with excellent accessibility.",
  unitsCount: 55,
  availableUnits: 30,
  typicalArea: "200–230 m²",
  position: {
    top: "10%",
    left: "65%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-6",
  name: "BLOCK 6",
  description: "Central location close to shopping area.",
  unitsCount: 48,
  availableUnits: 15,
  typicalArea: "185–205 m²",
  position: {
    top: "10%",
    left: "80%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-7",
  name: "BLOCK 7",
  description: "Spacious plots with garden areas.",
  unitsCount: 42,
  availableUnits: 28,
  typicalArea: "210–240 m²",
  position: {
    top: "30%",
    left: "5%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-8",
  name: "BLOCK 8",
  description: "Modern design with wide streets.",
  unitsCount: 52,
  availableUnits: 20,
  typicalArea: "195–215 m²",
  position: {
    top: "30%",
    left: "20%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-9",
  name: "BLOCK 9",
  description: "Family-friendly with playgrounds.",
  unitsCount: 58,
  availableUnits: 35,
  typicalArea: "180–200 m²",
  position: {
    top: "30%",
    left: "35%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-10",
  name: "BLOCK 10",
  description: "Well-connected to main roads.",
  unitsCount: 46,
  availableUnits: 19,
  typicalArea: "200–220 m²",
  position: {
    top: "30%",
    left: "50%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-11",
  name: "BLOCK 11",
  description: "Peaceful area with green spaces.",
  unitsCount: 44,
  availableUnits: 26,
  typicalArea: "190–210 m²",
  position: {
    top: "30%",
    left: "65%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-12",
  name: "BLOCK 12",
  description: "Prime location near schools.",
  unitsCount: 50,
  availableUnits: 12,
  typicalArea: "205–225 m²",
  position: {
    top: "30%",
    left: "80%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-13",
  name: "BLOCK 13",
  description: "Excellent value with good amenities.",
  unitsCount: 54,
  availableUnits: 31,
  typicalArea: "185–205 m²",
  position: {
    top: "50%",
    left: "5%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-14",
  name: "BLOCK 14",
  description: "Spacious units with modern facilities.",
  unitsCount: 47,
  availableUnits: 24,
  typicalArea: "210–230 m²",
  position: {
    top: "50%",
    left: "20%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-15",
  name: "BLOCK 15",
  description: "Well-planned with optimal orientation.",
  unitsCount: 51,
  availableUnits: 17,
  typicalArea: "195–215 m²",
  position: {
    top: "50%",
    left: "35%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-16",
  name: "BLOCK 16",
  description: "Close to community center.",
  unitsCount: 49,
  availableUnits: 29,
  typicalArea: "200–220 m²",
  position: {
    top: "50%",
    left: "50%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-17",
  name: "BLOCK 17",
  description: "Quiet corner with privacy.",
  unitsCount: 43,
  availableUnits: 21,
  typicalArea: "190–210 m²",
  position: {
    top: "50%",
    left: "65%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-18",
  name: "BLOCK 18",
  description: "Easy access to main gate.",
  unitsCount: 56,
  availableUnits: 33,
  typicalArea: "180–200 m²",
  position: {
    top: "50%",
    left: "80%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-19",
  name: "BLOCK 19",
  description: "Large plots with extra space.",
  unitsCount: 38,
  availableUnits: 16,
  typicalArea: "220–250 m²",
  position: {
    top: "70%",
    left: "15%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-20",
  name: "BLOCK 20",
  description: "Modern infrastructure and utilities.",
  unitsCount: 53,
  availableUnits: 27,
  typicalArea: "195–215 m²",
  position: {
    top: "70%",
    left: "35%",
    width: "12%",
    height: "15%"
  }
}, {
  id: "block-21",
  name: "BLOCK 21",
  description: "Premium corner units available.",
  unitsCount: 41,
  availableUnits: 14,
  typicalArea: "205–235 m²",
  position: {
    top: "70%",
    left: "65%",
    width: "12%",
    height: "15%"
  }
}];
export function InteractiveSitePlan() {
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  return <Card className="w-full">
      
      
    </Card>;
}