import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFormContext } from '@/contexts/FormContext';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  FileText,
  Users,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const FormResponses: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFormById, responses } = useFormContext();
  const { toast } = useToast();
  
  const [form, setForm] = useState(getFormById(id || ''));
  const [selectedResponse, setSelectedResponse] = useState<typeof responses[0] | null>(null);

  useEffect(() => {
    if (id) {
      setForm(getFormById(id));
    }
  }, [id, getFormById]);

  if (!form) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Form Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </DashboardLayout>
    );
  }

  const formResponses = responses.filter(r => r.formId === form.id);

  const exportToCSV = () => {
    if (formResponses.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no responses to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = form.fields.map(f => f.label).join(',');
    const rows = formResponses.map(response => {
      return form.fields.map(field => {
        const value = response.answers[field.id];
        if (Array.isArray(value)) {
          return `"${value.join(', ')}"`;
        }
        return `"${value || ''}"`;
      }).join(',');
    });

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Responses have been exported to CSV.",
    });
  };

  const getFieldLabel = (fieldId: string) => {
    const field = form.fields.find(f => f.id === fieldId);
    return field?.label || fieldId;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold">{form.title}</h1>
              <p className="text-muted-foreground text-sm">Response Management</p>
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={formResponses.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{formResponses.length}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{form.fields.length}</p>
                <p className="text-sm text-muted-foreground">Form Fields</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">
                  {formResponses.length > 0 
                    ? format(new Date(formResponses[formResponses.length - 1].submittedAt), 'MMM d')
                    : 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Last Response</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Responses</CardTitle>
            <CardDescription>View all form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {formResponses.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                <p className="text-muted-foreground">
                  Share your form to start collecting responses
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">#</TableHead>
                      {form.fields.slice(0, 3).map(field => (
                        <TableHead key={field.id}>{field.label}</TableHead>
                      ))}
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formResponses.map((response, index) => (
                      <TableRow key={response.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        {form.fields.slice(0, 3).map(field => (
                          <TableCell key={field.id} className="max-w-[200px] truncate">
                            {Array.isArray(response.answers[field.id])
                              ? response.answers[field.id].join(', ')
                              : response.answers[field.id] || '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-muted-foreground">
                          {format(new Date(response.submittedAt), 'MMM d, yyyy h:mm a')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedResponse(response)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Detail Dialog */}
        <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Response Details</DialogTitle>
              <DialogDescription>
                Submitted on {selectedResponse && format(new Date(selectedResponse.submittedAt), 'MMMM d, yyyy h:mm a')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {selectedResponse && Object.entries(selectedResponse.answers).map(([fieldId, value]) => (
                <div key={fieldId} className="border-b border-border pb-3">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {getFieldLabel(fieldId)}
                  </p>
                  <p className="text-foreground">
                    {Array.isArray(value) ? value.join(', ') : value || '-'}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default FormResponses;
