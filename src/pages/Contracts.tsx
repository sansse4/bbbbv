import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, FilePlus, FileCheck, FileClock } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

const Contracts = () => {
  const contracts = [
    { id: 1, property: "Luxury Villa #401", client: "Ahmed Hassan", value: "$450,000", status: "signed", date: "2024-03-15" },
    { id: 2, property: "Downtown Apartment", client: "Sara Mohammed", value: "$280,000", status: "pending", date: "2024-03-14" },
    { id: 3, property: "Commercial Space", client: "Khaled Ali", value: "$680,000", status: "review", date: "2024-03-13" },
    { id: 4, property: "Suburban House", client: "Fatima Omar", value: "$320,000", status: "signed", date: "2024-03-12" },
    { id: 5, property: "Office Building", client: "Ibrahim Mahmoud", value: "$1,200,000", status: "draft", date: "2024-03-11" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "review":
        return "bg-accent text-accent-foreground";
      case "draft":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contract Registration</h1>
          <p className="text-muted-foreground mt-1">
            Manage purchase agreements and legal documents
          </p>
        </div>
        <Button className="gap-2">
          <FilePlus className="h-4 w-4" />
          New Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Contracts"
          value="342"
          change="+15.2%"
          trend="up"
          icon={FileText}
        />
        <MetricCard
          title="Signed"
          value="278"
          change="+18.7%"
          trend="up"
          icon={FileCheck}
        />
        <MetricCard
          title="Pending"
          value="42"
          change="-5.3%"
          trend="down"
          icon={FileClock}
        />
        <MetricCard
          title="In Review"
          value="22"
          change="+8.1%"
          trend="up"
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contract Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.property}</TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell className="font-semibold">{contract.value}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{contract.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Contract
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contracts;
