'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DropoutChartProps {
  data: { name: string; dropoutRate: number }[];
  title: string;
  chartType?: "bar" | "line";
}

interface DropoutData {
  gender: DropoutChartProps["data"];
  area: DropoutChartProps["data"];
  caste: DropoutChartProps["data"];
  standard: DropoutChartProps["data"];
}

export default function DropoutInsights() {
  const [selectedTab, setSelectedTab] = useState("gender");
  const [dropoutData, setDropoutData] = useState<DropoutData | null>(null);
  const [selectedState, setSelectedState] = useState("india"); // you can pass this as prop from dashboard later

  useEffect(() => {
    axios.get<DropoutData>(`http://localhost:5000/api/dropout-insights/${selectedState}`)
    .then((res) => setDropoutData(res.data))
      .catch((err) => {
        console.error("Error fetching dropout insights", err);
        setDropoutData(null);
      });
  }, [selectedState]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Detailed Dropout Analysis</CardTitle>
          <CardDescription>Segmented by various demographic factors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="your-tabs-class">
            <TabsList>
            <TabsTrigger
              value="gender"
              isSelected={selectedTab === "gender"}
              onClick={() => setSelectedTab("gender")}
            >  Gender
            </TabsTrigger>
            <TabsTrigger
  value="area"
  isSelected={selectedTab === "area"}
  onClick={() => setSelectedTab("area")}
>
area
</TabsTrigger>

<TabsTrigger
  value="caste"
  isSelected={selectedTab === "caste"}
  onClick={() => setSelectedTab("caste")}
>
caste
</TabsTrigger>

<TabsTrigger
  value="standard"
  isSelected={selectedTab === "standard"}
  onClick={() => setSelectedTab("standard")}
>
standard
</TabsTrigger>

            </TabsList>

            {dropoutData && selectedTab === "gender" && (
              <DropoutChart data={dropoutData.gender} title="Dropout Rate by Gender" />
            )}
            {dropoutData && selectedTab === "area" && (
              <DropoutChart data={dropoutData.area} title="Dropout Rate by Area" />
            )}
            {dropoutData && selectedTab === "caste" && (
              <DropoutChart data={dropoutData.caste} title="Dropout Rate by Caste" />
            )}
            {dropoutData && selectedTab === "standard" && (
              <DropoutChart data={dropoutData.standard} title="Dropout Rate by Standard" chartType="line" />
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function DropoutChart({ data, title, chartType = "bar" }: DropoutChartProps) {
  return (
    <div className="h-[300px]">
      <h3 className="text-black font-medium mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="dropoutRate" fill="#3B82F6" />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="dropoutRate" stroke="#3B82F6" />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
