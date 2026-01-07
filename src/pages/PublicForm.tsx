import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormContext } from '@/contexts/FormContext';
import { FormField } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { FileText, Calendar as CalendarIcon, Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const PublicForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getFormById, submitResponse } = useFormContext();
  const { toast } = useToast();
  
  const [form, setForm] = useState(getFormById(id || ''));
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const foundForm = getFormById(id);
      setForm(foundForm);
    }
  }, [id, getFormById]);

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Form Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This form doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (form.status === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-display font-bold mb-2">Form Unavailable</h1>
          <p className="text-muted-foreground">
            This form is currently not accepting responses.
          </p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-success/20 mx-auto mb-6 flex items-center justify-center">
            <Check className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">
            Thank You!
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            {form.settings.thankYouMessage}
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const pages = [...new Set(form.fields.map(f => f.pageNumber))].sort();
  const currentFields = form.fields.filter(f => f.pageNumber === currentPage);
  const totalPages = pages.length || 1;
  const progress = ((currentPage - 1) / totalPages) * 100;

  const validateCurrentPage = () => {
    const newErrors: Record<string, string> = {};
    
    currentFields.forEach(field => {
      if (field.required && !answers[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      if (field.type === 'email' && answers[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answers[field.id])) {
          newErrors[field.id] = 'Please enter a valid email address';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentPage()) {
      if (currentPage < totalPages) {
        setCurrentPage(prev => prev + 1);
      } else {
        handleSubmit();
      }
    } else {
      toast({
        title: "Please fill in required fields",
        description: "Some fields need your attention.",
        variant: "destructive",
      });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      submitResponse(form.id, answers);
      setIsSubmitted(true);
    } catch {
      toast({
        title: "Submission failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAnswer = (fieldId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const renderField = (field: FormField) => {
    const error = errors[field.id];
    const commonProps = {
      id: field.id,
      className: cn(error && "border-destructive"),
    };

    switch (field.type) {
      case 'text':
      case 'first_name':
      case 'last_name':
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("h-12", error && "border-destructive")}
          />
        );

      case 'email':
        return (
          <Input
            {...commonProps}
            type="email"
            placeholder={field.placeholder || 'email@example.com'}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("h-12", error && "border-destructive")}
          />
        );

      case 'phone':
        return (
          <Input
            {...commonProps}
            type="tel"
            placeholder={field.placeholder || '+1 (555) 000-0000'}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("h-12", error && "border-destructive")}
          />
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            placeholder={field.placeholder}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("h-12", error && "border-destructive")}
          />
        );

      case 'password':
        return (
          <Input
            {...commonProps}
            type="password"
            placeholder={field.placeholder || '••••••••'}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("h-12", error && "border-destructive")}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("min-h-[120px] resize-none", error && "border-destructive")}
          />
        );

      case 'dropdown':
        return (
          <Select
            value={answers[field.id] || ''}
            onValueChange={(value) => updateAnswer(field.id, value)}
          >
            <SelectTrigger className={cn("h-12", error && "border-destructive")}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={answers[field.id] || ''}
            onValueChange={(value) => updateAnswer(field.id, value)}
            className="space-y-3"
          >
            {field.options?.map(option => (
              <div key={option.id} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.id}`} />
                <Label htmlFor={`${field.id}-${option.id}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        const checkboxValues = answers[field.id] || [];
        return (
          <div className="space-y-3">
            {field.options?.map(option => (
              <div key={option.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`${field.id}-${option.id}`}
                  checked={checkboxValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...checkboxValues, option.value]
                      : checkboxValues.filter((v: string) => v !== option.value);
                    updateAnswer(field.id, newValues);
                  }}
                />
                <Label htmlFor={`${field.id}-${option.id}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal",
                  !answers[field.id] && "text-muted-foreground",
                  error && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {answers[field.id] ? format(new Date(answers[field.id]), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={answers[field.id] ? new Date(answers[field.id]) : undefined}
                onSelect={(date) => updateAnswer(field.id, date?.toISOString())}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'file':
        return (
          <div className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-colors hover:border-primary/50 cursor-pointer",
            error ? "border-destructive" : "border-border"
          )}>
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, JPG, PNG (Max 10MB)
            </p>
            <Input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                updateAnswer(field.id, files.map(f => f.name));
              }}
            />
          </div>
        );

      default:
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
            value={answers[field.id] || ''}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            className={cn("h-12", error && "border-destructive")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">FormCraft</span>
          </div>
          <Progress value={progress} className="h-1" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>Page {currentPage} of {totalPages}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-fade-in">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold mb-3">{form.title}</h1>
            {form.description && (
              <p className="text-muted-foreground text-lg">{form.description}</p>
            )}
          </div>

          {/* Fields */}
          <div className="space-y-6">
            {currentFields.map(field => (
              <div key={field.id} className="animate-slide-up">
                <Label htmlFor={field.id} className="text-base font-medium mb-2 block">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-sm text-destructive mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : currentPage === totalPages ? (
                <>
                  Submit
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicForm;
