import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  Activity,
  BarChart3,
  Users,
  Plus,
  MoreHorizontal,
  Pencil,
  Eye,
  Share2,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: { value: number; positive: boolean };
}> = ({ title, value, icon: Icon, description, trend }) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold font-display">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div className={`flex items-center text-xs mt-2 ${trend.positive ? 'text-success' : 'text-destructive'}`}>
          <span>{trend.positive ? '+' : ''}{trend.value}%</span>
          <span className="text-muted-foreground ml-1">from last month</span>
        </div>
      )}
    </CardContent>
    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/5 rounded-full" />
  </Card>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { forms, stats, toggleFormStatus, deleteForm, responses } = useFormContext();
  const { toast } = useToast();

  const handleCopyLink = (formId: string) => {
    const link = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Form link has been copied to clipboard.",
    });
  };

  const handleDelete = (formId: string) => {
    deleteForm(formId);
    toast({
      title: "Form deleted",
      description: "The form has been permanently deleted.",
    });
  };

  const getResponseCount = (formId: string) => {
    return responses.filter(r => r.formId === formId).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's an overview of your forms.
            </p>
          </div>
          <Button onClick={() => navigate('/forms/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Form
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Forms"
            value={stats.totalForms}
            icon={FileText}
            description="All created forms"
          />
          <StatCard
            title="Active Forms"
            value={stats.activeForms}
            icon={Activity}
            description="Currently accepting responses"
            trend={{ value: 12, positive: true }}
          />
          <StatCard
            title="Inactive Forms"
            value={stats.inactiveForms}
            icon={BarChart3}
            description="Paused or draft forms"
          />
          <StatCard
            title="Total Responses"
            value={stats.totalResponses}
            icon={Users}
            description="All form submissions"
            trend={{ value: 8, positive: true }}
          />
        </div>

        {/* Forms Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Your Forms</CardTitle>
            <CardDescription>
              Manage and view all your created forms
            </CardDescription>
          </CardHeader>
          <CardContent>
            {forms.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No forms yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first form to get started
                </p>
                <Button onClick={() => navigate('/forms/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Form Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => (
                      <TableRow key={form.id} className="group">
                        <TableCell>
                          <div>
                            <p className="font-medium">{form.title}</p>
                            {form.description && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {form.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={form.status === 'active'}
                              onCheckedChange={() => toggleFormStatus(form.id)}
                            />
                            <span className={`text-sm ${form.status === 'active' ? 'text-success' : 'text-muted-foreground'}`}>
                              {form.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {getResponseCount(form.id)}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(form.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => navigate(`/forms/${form.id}/edit`)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/forms/${form.id}/responses`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Responses
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`/form/${form.id}`, '_blank')}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyLink(form.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/forms/${form.id}/share`)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share via Email
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(form.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
