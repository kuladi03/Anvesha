'use client'

import { useEffect, useState } from "react";
import axios from "axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, HeartHandshake, Lightbulb } from 'lucide-react';

interface SolutionItem {
  title: string;
  description: string;
  icon: 'GraduationCap' | 'HeartHandshake' | 'BookOpen' | 'Lightbulb';
}

interface SolutionData {
  government: SolutionItem[];
  scholarships: SolutionItem[];
  learning: SolutionItem[];
  support: SolutionItem[];
}

export default function SolutionPathways() {
  const [selectedTab, setSelectedTab] = useState("government");
  const [solutionData, setSolutionData] = useState<SolutionData | null>(null);
  const [selectedState, setSelectedState] = useState("india"); // you can pass this from Dashboard if needed

  useEffect(() => {
    // axios.get('http://localhost:5000/api/solution-pathways')
    //   .then(res => setSolutionData(res.data))
    //   .catch(err => console.error('Error fetching solution pathways', err));
  }, []);
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalized Intervention Strategies</CardTitle>
          <CardDescription>Tailored solutions to reduce dropout risk</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="government" isSelected={selectedTab === "government"}>Government Schemes</TabsTrigger>
              <TabsTrigger value="scholarships" isSelected={selectedTab === "scholarships"}>Scholarships</TabsTrigger>
              <TabsTrigger value="learning" isSelected={selectedTab === "learning"}>Learning Paths</TabsTrigger>
              <TabsTrigger value="support" isSelected={selectedTab === "support"}>Support Programs</TabsTrigger>
            </TabsList>

            {solutionData && selectedTab === "government" && (
              <SolutionsList title="Government Educational Support Programs" items={solutionData.government} actionLabel="Explore More Schemes" />
            )}
            {solutionData && selectedTab === "scholarships" && (
              <SolutionsList title="Scholarship Opportunities" items={solutionData.scholarships} actionLabel="Find Scholarships" />
            )}
            {solutionData && selectedTab === "learning" && (
              <SolutionsList title="Personalized Learning Paths" items={solutionData.learning} actionLabel="Customize Learning Path" />
            )}
            {solutionData && selectedTab === "support" && (
              <SolutionsList title="Additional Support Programs" items={solutionData.support} actionLabel="Get More Support" />
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SolutionsList({ title, items, actionLabel }: { title: string; items: SolutionItem[]; actionLabel: string }) {
  const iconMap = {
    GraduationCap: GraduationCap,
    HeartHandshake: HeartHandshake,
    BookOpen: BookOpen,
    Lightbulb: Lightbulb,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg text-black font-medium">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => {
          const Icon = iconMap[item.icon];
          return (
            <li key={index} className="flex items-start">
              <Icon className="mr-2 h-5 w-5 mt-0.5 text-black" />
              <div>
                <h4 className="font-medium text-black">{item.title}</h4>
                <p className="text-black text-sm text-muted-foreground">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <Button>{actionLabel}</Button>
    </div>
  );
}