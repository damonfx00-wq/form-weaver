import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFormContext } from '@/contexts/FormContext';
import { FormField, FieldType } from '@/types/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Phone,
  Type,
  AlignLeft,
  ChevronDown,
  Circle,
  CheckSquare,
  Calendar,
  Upload,
  Hash,
  Lock,
  GripVertical,
  Trash2,
  Copy,
  Save,
  Eye,
  ArrowLeft,
  Settings2,
  Plus,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FieldComponentConfig {
  type: FieldType;
  label: string;
  icon: React.ElementType;
  category: 'basic' | 'advanced';
}

const fieldComponents: FieldComponentConfig[] = [
  { type: 'first_name', label: 'First Name', icon: User, category: 'basic' },
  { type: 'last_name', label: 'Last Name', icon: User, category: 'basic' },
  { type: 'email', label: 'Email', icon: Mail, category: 'basic' },
  { type: 'phone', label: 'Phone', icon: Phone, category: 'basic' },
  { type: 'text', label: 'Text Input', icon: Type, category: 'basic' },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft, category: 'basic' },
  { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, category: 'advanced' },
  { type: 'radio', label: 'Radio Buttons', icon: Circle, category: 'advanced' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, category: 'advanced' },
  { type: 'date', label: 'Date Picker', icon: Calendar, category: 'advanced' },
  { type: 'file', label: 'File Upload', icon: Upload, category: 'advanced' },
  { type: 'number', label: 'Number', icon: Hash, category: 'advanced' },
  { type: 'password', label: 'Password', icon: Lock, category: 'advanced' },
];

const FormBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentForm, setCurrentForm, getFormById, createForm, updateForm, addField, updateField, removeField, reorderFields } = useFormContext();
  const { toast } = useToast();
  
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      const form = getFormById(id);
      if (form) {
        setCurrentForm(form);
        setFormTitle(form.title);
        setFormDescription(form.description || '');
      }
    } else {
      // New form
      setCurrentForm(null);
      setFormTitle('');
      setFormDescription('');
    }
  }, [id, getFormById, setCurrentForm]);

  const handleAddField = (type: FieldType) => {
    if (!currentForm && (!formTitle.trim())) {
      toast({
        title: "Please add a title",
        description: "Enter a form title before adding fields.",
        variant: "destructive",
      });
      return;
    }

    // Create form if it doesn't exist
    if (!currentForm) {
      const newForm = createForm(formTitle, formDescription);
      setCurrentForm(newForm);
      navigate(`/forms/${newForm.id}/edit`, { replace: true });
    }

    const fieldConfig = fieldComponents.find(f => f.type === type);
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: fieldConfig?.label || 'New Field',
      required: false,
      pageNumber: 1,
      options: ['dropdown', 'radio', 'checkbox'].includes(type) 
        ? [
            { id: 'opt1', label: 'Option 1', value: 'option1' },
            { id: 'opt2', label: 'Option 2', value: 'option2' },
          ]
        : undefined,
    };

    addField(newField);
    setSelectedField(newField);
    
    toast({
      title: "Field added",
      description: `${fieldConfig?.label} has been added to your form.`,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    reorderFields(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    if (currentForm) {
      updateForm(currentForm.id, { title: formTitle, description: formDescription });
      toast({
        title: "Form saved",
        description: "Your changes have been saved successfully.",
      });
    }
  };

  const handlePreview = () => {
    if (currentForm) {
      window.open(`/form/${currentForm.id}`, '_blank');
    }
  };

  const renderFieldPreview = (field: FormField) => {
    const baseInputClass = "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm";
    
    switch (field.type) {
      case 'textarea':
        return <div className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm text-muted-foreground">{field.placeholder || 'Enter text...'}</div>;
      case 'dropdown':
        return (
          <div className={cn(baseInputClass, "flex items-center justify-between text-muted-foreground")}>
            <span>Select an option</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <div key={opt.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-border" />
                <span className="text-sm">{opt.label}</span>
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map(opt => (
              <div key={opt.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-border" />
                <span className="text-sm">{opt.label}</span>
              </div>
            ))}
          </div>
        );
      case 'date':
        return (
          <div className={cn(baseInputClass, "flex items-center justify-between text-muted-foreground")}>
            <span>Pick a date</span>
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'file':
        return (
          <div className="w-full h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Upload className="w-6 h-6 mx-auto mb-1" />
              <span className="text-sm">Drop files here or click to upload</span>
            </div>
          </div>
        );
      default:
        return <div className={cn(baseInputClass, "text-muted-foreground flex items-center")}>{field.placeholder || `Enter ${field.label.toLowerCase()}...`}</div>;
    }
  };

  const basicFields = fieldComponents.filter(f => f.category === 'basic');
  const advancedFields = fieldComponents.filter(f => f.category === 'advanced');

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Untitled Form"
                className="text-xl font-display font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview} disabled={!currentForm}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={!formTitle.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Builder Area */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left Panel - Components */}
          <Card className="w-64 shrink-0 overflow-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Form Fields</CardTitle>
              <CardDescription className="text-xs">
                Click to add fields to your form
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Basic Fields</p>
                <div className="space-y-1">
                  {basicFields.map(field => (
                    <button
                      key={field.type}
                      onClick={() => handleAddField(field.type)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <field.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Advanced Fields</p>
                <div className="space-y-1">
                  {advancedFields.map(field => (
                    <button
                      key={field.type}
                      onClick={() => handleAddField(field.type)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-md bg-accent/50 flex items-center justify-center group-hover:bg-accent transition-colors">
                        <field.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-medium">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center - Form Preview */}
          <Card className="flex-1 overflow-auto">
            <CardContent className="p-6">
              <div className="max-w-lg mx-auto">
                {/* Form Header */}
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-display font-bold mb-2">
                    {formTitle || 'Your Form Title'}
                  </h2>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Add a description for your form..."
                    className="text-center border-none bg-transparent resize-none focus-visible:ring-0 text-muted-foreground"
                  />
                </div>

                {/* Fields */}
                {currentForm?.fields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <Plus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Click a field type from the left panel to add it here
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {currentForm?.fields.map((field, index) => (
                    <div
                      key={field.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => setSelectedField(field)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all group",
                        selectedField?.id === field.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50",
                        draggedIndex === index && "opacity-50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <button className="mt-1 p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Label className="text-sm font-medium">
                              {field.label}
                              {field.required && <span className="text-destructive ml-1">*</span>}
                            </Label>
                          </div>
                          {renderFieldPreview(field)}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newField = { ...field, id: `field_${Date.now()}` };
                              addField(newField);
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeField(field.id);
                              if (selectedField?.id === field.id) {
                                setSelectedField(null);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Field Settings */}
          <Card className="w-72 shrink-0 overflow-auto">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Field Settings
                </CardTitle>
                {selectedField && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedField(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedField ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Field Label</Label>
                    <Input
                      value={selectedField.label}
                      onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={selectedField.placeholder || ''}
                      onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                      placeholder="Enter placeholder text..."
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Required</Label>
                    <Switch
                      checked={selectedField.required}
                      onCheckedChange={(checked) => updateField(selectedField.id, { required: checked })}
                    />
                  </div>

                  {['dropdown', 'radio', 'checkbox'].includes(selectedField.type) && (
                    <div className="space-y-2">
                      <Label className="text-xs">Options</Label>
                      <div className="space-y-2">
                        {selectedField.options?.map((option, idx) => (
                          <div key={option.id} className="flex items-center gap-2">
                            <Input
                              value={option.label}
                              onChange={(e) => {
                                const newOptions = [...(selectedField.options || [])];
                                newOptions[idx] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') };
                                updateField(selectedField.id, { options: newOptions });
                              }}
                              className="h-8 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => {
                                const newOptions = selectedField.options?.filter((_, i) => i !== idx);
                                updateField(selectedField.id, { options: newOptions });
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            const newOption = {
                              id: `opt_${Date.now()}`,
                              label: `Option ${(selectedField.options?.length || 0) + 1}`,
                              value: `option_${(selectedField.options?.length || 0) + 1}`,
                            };
                            updateField(selectedField.id, {
                              options: [...(selectedField.options || []), newOption],
                            });
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a field to edit its settings</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FormBuilder;
