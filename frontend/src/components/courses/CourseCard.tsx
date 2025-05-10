import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CourseCardProps {
  title: string;
  description: string;
  students: number;
  status: 'active' | 'completed' | 'upcoming';
  origin: string;
}

export const CourseCard = ({ title, description, students, status, origin }: CourseCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow relative overflow-visible">
      {/* Origin badge - top-right sticker */}
      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md shadow-sm z-10">
        {origin}
      </div>

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="text-sm text-muted-foreground">
          {students} enrolled students
        </div>
      </CardContent>
    </Card>
  );
};
