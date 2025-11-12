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
import { TrendingUp, DollarSign, Target, Award } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";

const Sales = () => {
  const salesData = [
    { id: 1, property: "Luxury Villa #401", client: "Ahmed Hassan", amount: "$450,000", status: "closed", date: "2024-03-15" },
    { id: 2, property: "Downtown Apartment", client: "Sara Mohammed", amount: "$280,000", status: "pending", date: "2024-03-14" },
    { id: 3, property: "Commercial Space", client: "Khaled Ali", amount: "$680,000", status: "negotiation", date: "2024-03-13" },
    { id: 4, property: "Suburban House", client: "Fatima Omar", amount: "$320,000", status: "closed", date: "2024-03-12" },
    { id: 5, property: "Office Building", client: "Ibrahim Mahmoud", amount: "$1,200,000", status: "pending", date: "2024-03-11" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "negotiation":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage property sales performance
          </p>
        </div>
        <Button className="gap-2">
          <TrendingUp className="h-4 w-4" />
          New Sale
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sales"
          value="$2.93M"
          change="+23.5%"
          trend="up"
          icon={DollarSign}
        />
        <MetricCard
          title="Deals Closed"
          value="87"
          change="+12.8%"
          trend="up"
          icon={Award}
        />
        <MetricCard
          title="Conversion Rate"
          value="68%"
          change="+5.2%"
          trend="up"
          icon={Target}
        />
        <MetricCard
          title="Avg Deal Size"
          value="$337K"
          change="+8.9%"
          trend="up"
          icon={TrendingUp}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.property}</TableCell>
                  <TableCell>{sale.client}</TableCell>
                  <TableCell className="font-semibold">{sale.amount}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sale.status)}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
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

export default Sales;
