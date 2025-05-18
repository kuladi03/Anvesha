import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Clock, Calendar } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  students: number;
  status: 'active' | 'completed' | 'upcoming';
  origin: string;
}

const statusConfig = {
  active: {
    color: "bg-green-100 text-green-800",
    icon: <BadgeCheck className="inline-block w-4 h-4 mr-1" />,
    label: "Active",
  },
  completed: {
    color: "bg-blue-100 text-blue-800",
    icon: <Calendar className="inline-block w-4 h-4 mr-1" />,
    label: "Completed",
  },
  upcoming: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <Clock className="inline-block w-4 h-4 mr-1" />,
    label: "Upcoming",
  },
};

export const CourseCard = ({
  title,
  description,
  students,
  status,
  origin,
}: CourseCardProps) => {
  const statusProps = statusConfig[status] || {
    color: "bg-gray-100 text-gray-800",
    icon: null,
    label: status,
  };

  return (
    <Card className="hover:shadow-lg transition-shadow relative overflow-visible border border-gray-200">
      {/* Origin badge - top-right sticker */}
      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow z-10 font-medium tracking-wide">
        {origin}
      </div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold truncate max-w-[70%]">{title}</CardTitle>
        <span
          className={`flex items-center px-2 py-1 rounded-full text-xs font-semibold ${statusProps.color}`}
        >
          {statusProps.icon}
          {statusProps.label}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">{students}</span>
          <span>enrolled students</span>
        </div>
      </CardContent>
    </Card>
  );
};
