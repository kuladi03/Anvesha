'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Anvesha from "../../../public/Anvesha.png"  // ✅ Update this if your path is different
import { Select, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer , Cell ,
  CartesianGrid,
  LabelList
} from "recharts";


const datasetMap: Record<string, string> = {
  "All India": "india",
  "Maharashtra": "maharashtra",
  "Karnataka": "karnataka",
  "Tamil Nadu": "tamil_nadu",
};

const demographicTabs = [
  { id: "gender", label: "Gender vs Dropout" },
  { id: "debtor", label: "Debtor vs Dropout" },
  { id: "tuition", label: "Tuition vs Dropout" },
  { id: "age", label: "Age vs Dropout" },
];

interface SolutionPathway {
  _id: string;
  addedOn: string;
  category: string;
  dataset: string;
  description: string;
  impact: string;
  implementingAgency: string;
  link: string;
  targetGroup: string;
  title: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [selectedState, setSelectedState] = useState('All India');
  const [reportId, setReportId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("gender");
  const [topFeatures, setTopFeatures] = useState<{ name: string; value: number }[]>([]);
  const [solutionPathways, setSolutionPathways] = useState<SolutionPathway[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Government Scheme");
  
  const dataset = datasetMap[selectedState] || "india";
  
  const goToLanding = () => {
    router.push('/landing')  // Adjust the path if your landing page is elsewhere
  }

  const categoryLabels: Record<string, Record<string, string>> = {
    gender: { "0": "Female", "1": "Male" },
    debtor: { "0": "No Debt", "1": "Has Debt" },
    tuition: { "0": "Not Paid", "1": "Paid" },
    age: {
      "18-22": "18–22",
      "23-26": "23–26",
      "27-30": "27–30",
      "31+": "31+",
      "<18": "<18"
    },
  };

  const formatData = (data: any, type: string) => {
    const labels = categoryLabels[type] || {};
    return Object.entries(data || {}).map(([key, value]: [string, any]) => ({
      category: labels[key] || key,
      ...value,
    }));
  };

      const filteredData = solutionPathways.filter(
    (item) => item.category === selectedCategory
  );

  // Get unique categories from the data
  const categories = [
    ...new Set(solutionPathways.map((item) => item.category)),
  ];

  // Fetch report ID when dataset changes
  // Fetch report ID and top features when dataset changes
    useEffect(() => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        console.error("Backend URL is not defined");
        return;
      }
      axios.get<{ report_id: string; top_features: string[] }>(
        `${backendUrl}/api/latest-report/${dataset}`
      )
        .then((res) => {
          setReportId(res.data.report_id);
          // Directly set topFeatures as an array (no need to split the string)
          const features = res.data.top_features.map((feature, index) => ({
            name: feature.trim(),
            value: 10 - index, // Importance score based on the order in the list
          }));
          setTopFeatures(features); // Update top features
          setIsLoading(false); // Set loading to false when data is received
        })
        .catch(() => {
          setReportId(null);
          setTopFeatures([]); // Clear the top features on error
        });
    }, [dataset]); // This effect runs when dataset changes



  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/dashboard/${dataset}`)
      .then((res) => {
        setDashboardData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching dashboard data:", err);
      });
  }, [dataset]);

  useEffect(() => {
    const fetchSolutionPathways = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/solution-pathways`);
        const data = await response.json();
        setSolutionPathways(data);
      } catch (error) {
        console.error("Error fetching solution pathways:", error);
      }
    };

    fetchSolutionPathways();
  }, []);



console.log("Top Features: ", topFeatures);
  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <img src={Anvesha.src} alt="Logo" className="h-10" />
        </Link>
        <div className="flex items-center gap-6">
          <button onClick={goToLanding} className="text-gray-900 hover:text-indigo-500">
            Saarthi ↗
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 px-6 py-8 space-y-6 bg-gray-50">
        <div>
          <div className="flex items-center justify-between mt-6">
          {/* Select Region Dropdown */}
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectValue placeholder="Select Region" />
            <SelectItem value="All India">All India</SelectItem>
            <SelectItem value="Maharashtra">Maharashtra</SelectItem>
            <SelectItem value="Karnataka">Karnataka</SelectItem>
            <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
          </Select>
            {/* Loading State */}
            {isLoading && <div>Loading...</div>}

            {/* Report Button */}
            {reportId && !isLoading && (
              <button
                onClick={() => window.open(`http://localhost:5000/report/${reportId}`, "_blank")}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
              >
                View ML Report
              </button>
            )}
            
            {/* Error or No Report */}
            {!reportId && !isLoading && <div>No report available for the selected region</div>}
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Students</CardTitle>
              </CardHeader>
              <CardContent>{dashboardData?.total_students ?? "Loading..."}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropout Students</CardTitle>
              </CardHeader>
              <CardContent>{dashboardData?.dropout_students ?? "Loading..."}</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dropout Rate</CardTitle>
              </CardHeader>
              <CardContent>{dashboardData ? `${dashboardData.dropout_rate}%` : "Loading..."}</CardContent>
            </Card>
          </div>

           <div className="mt-10">
            <h2 className="text-xl text-black font-semibold mb-4">Dropout Reasons by Importance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={topFeatures}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <CartesianGrid horizontal={true} vertical={false} strokeDasharray="3 3" opacity={0.4} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  animationDuration={1500}
                  barSize={24}
                >
                  {topFeatures.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`hsl(210, 80%, ${65 - (index * 5)}%)`} // Blue gradient
                    />
                  ))}
                  <LabelList 
                    dataKey="value" 
                    position="right"
                    formatter={(value: number) => `${value}`}
                    fill="#666"
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>


          {/* --- Demographic Insights --- */}
          <div className="mt-10">
  <h2 className="text-xl font-semibold text-black mb-4">Demographic Insights</h2>
  <Tabs value={activeTab} onValueChange={setActiveTab}>
    <TabsList>
      {demographicTabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          isSelected={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>

    {[
      { id: "gender", data: dashboardData?.gender_vs_dropout },
      { id: "debtor", data: dashboardData?.debtor_vs_dropout },
      { id: "tuition", data: dashboardData?.tuition_vs_dropout },
      { id: "age", data: dashboardData?.age_vs_dropout },
    ].map(({ id, data }) => (
      <TabsContent key={id} isActive={activeTab === id}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={formatData(data, id)}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              contentStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="Dropout" fill="#ef4444" name="Dropouts" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Enrolled" fill="#3b82f6" name="Enrolled" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Graduate" fill="#10b981" name="Graduates" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </TabsContent>
    ))}
  </Tabs>
</div>

           <div className="max-w-4xl mx-auto my-8 px-4">
  <h1 className="text-2xl font-bold text-center text-black mb-6">Solution Pathways</h1>
  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
    <TabsList className="flex justify-center gap-4 mb-6">
      {categories.map((category) => (
        <TabsTrigger
          key={category}
          value={category}
          isSelected={category === selectedCategory}
          onClick={() => setSelectedCategory(category)}
          className={`px-4 py-2 rounded-md border transition-colors duration-200 ${
            category === selectedCategory
              ? 'bg-purple-600 text-white'
              : 'bg-white text-black hover:bg-purple-100'
          }`}
        >
          {category.toUpperCase()}
        </TabsTrigger>
      ))}
    </TabsList>
    {categories.map((category) => (
      <TabsContent key={category} isActive={category === selectedCategory}>
        <ul className="space-y-4">
          {filteredData
            .filter((item) => item.category === category)
            .map((item) => (
              <li key={item._id} className="border border-gray-200 p-5 rounded-lg shadow-sm bg-white">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-800 mb-1">{item.description}</p>
                <p className="text-sm text-gray-700 mb-2">{item.impact}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline font-medium"
                >
                  More Info
                </a>
              </li>
            ))}
        </ul>
      </TabsContent>
    ))}
  </Tabs>
</div>

          </div>
      </main>
    </div>
  )
}