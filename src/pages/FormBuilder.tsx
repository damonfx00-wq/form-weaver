import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFormContext } from '@/contexts/FormContext';
import { FormField, FieldType, FieldWidth, FieldPosition } from '@/types/form';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  Menu,
  PanelRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFieldsPanel, setShowFieldsPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Get the selected field from the current form (keeps it in sync)
  const selectedField = currentForm?.fields.find(f => f.id === selectedFieldId) || null;
  
  // Calculate total pages
  const totalPages = currentForm?.fields.length 
    ? Math.max(...currentForm.fields.map(f => f.pageNumber), 1) 
    : 1;
  
  // Get fields for current page
  const currentPageFields = currentForm?.fields.filter(f => f.pageNumber === currentPage) || [];


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

    // Set page number based on current page
    newField.pageNumber = currentPage;
    addField(newField);
    setSelectedFieldId(newField.id);
    
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

  // Render fields panel content (reusable for both desktop and mobile)
  const renderFieldsPanelContent = () => (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Basic Fields</p>
        <div className="space-y-1">
          {basicFields.map(field => (
            <button
              key={field.type}
              onClick={() => {
                handleAddField(field.type);
                if (isMobile) setShowFieldsPanel(false);
              }}
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
              onClick={() => {
                handleAddField(field.type);
                if (isMobile) setShowFieldsPanel(false);
              }}
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
    </div>
  );

  // Render settings panel content (reusable for both desktop and mobile)
  const renderSettingsPanelContent = () => (
    <>
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

          <Separator />

          <div className="space-y-2">
            <Label className="text-xs">Field Width</Label>
            <div className="grid grid-cols-4 gap-1">
              {(['full', 'half', 'third', 'quarter'] as FieldWidth[]).map((w) => (
                <button
                  key={w}
                  onClick={() => updateField(selectedField.id, { width: w })}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded-md border transition-colors capitalize",
                    (selectedField.width || 'full') === w
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {w === 'full' ? '100%' : w === 'half' ? '50%' : w === 'third' ? '33%' : '25%'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Position</Label>
            <div className="grid grid-cols-3 gap-1">
              {(['left', 'center', 'right'] as FieldPosition[]).map((p) => (
                <button
                  key={p}
                  onClick={() => updateField(selectedField.id, { position: p })}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded-md border transition-colors capitalize",
                    (selectedField.position || 'left') === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Separator />

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
    </>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex-1 sm:flex-none">
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Untitled Form"
                className="text-lg sm:text-xl font-display font-bold border-none bg-transparent px-0 h-auto focus-visible:ring-0"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Mobile: Add Fields Button */}
            {isMobile && (
              <Sheet open={showFieldsPanel} onOpenChange={setShowFieldsPanel}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                    <Menu className="w-4 h-4 mr-2" />
                    Add Fields
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Form Fields</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {renderFieldsPanelContent()}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            <Button variant="outline" size="sm" onClick={handlePreview} disabled={!currentForm} className="flex-1 sm:flex-none">
              <Eye className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!formTitle.trim()} className="flex-1 sm:flex-none">
              <Save className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            {/* Mobile: Settings Button */}
            {isMobile && selectedField && (
              <Sheet open={showSettingsPanel} onOpenChange={setShowSettingsPanel}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PanelRight className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] overflow-auto">
                  <SheetHeader>
                    <SheetTitle>Field Settings</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    {renderSettingsPanelContent()}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Builder Area */}
        <div className="flex flex-1 gap-4 overflow-hidden">
          {/* Left Panel - Components (Desktop only) */}
          {!isMobile && (
            <Card className="w-64 shrink-0 overflow-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Form Fields</CardTitle>
                <CardDescription className="text-xs">
                  Click to add fields to your form
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFieldsPanelContent()}
              </CardContent>
            </Card>
          )}

          {/* Center - Form Preview */}
          <Card className="flex-1 overflow-auto">
            <CardContent className="p-3 sm:p-6">
              <div className="max-w-lg mx-auto">
                {/* Form Header */}
                <div className="mb-6 sm:mb-8 text-center">
                  <h2 className="text-xl sm:text-2xl font-display font-bold mb-2">
                    {formTitle || 'Your Form Title'}
                  </h2>
                  <Textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Add a description for your form..."
                    className="text-center border-none bg-transparent resize-none focus-visible:ring-0 text-muted-foreground"
                  />
                </div>

                {/* Page Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 hidden sm:block" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPage = totalPages + 1;
                        setCurrentPage(newPage);
                        toast({
                          title: "Page added",
                          description: `Page ${newPage} has been created.`,
                        });
                      }}
                    >
                      <Plus className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Add Page</span>
                    </Button>
                    {totalPages > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          if (currentPageFields.length > 0) {
                            toast({
                              title: "Cannot remove page",
                              description: "Remove all fields from this page first.",
                              variant: "destructive",
                            });
                            return;
                          }
                          // Remove the empty page by moving all higher page fields down
                          currentForm?.fields.forEach(field => {
                            if (field.pageNumber > currentPage) {
                              updateField(field.id, { pageNumber: field.pageNumber - 1 });
                            }
                          });
                          setCurrentPage(p => Math.max(1, p - 1));
                          toast({
                            title: "Page removed",
                            description: "The empty page has been deleted.",
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 sm:mr-1" />
                        <span className="hidden sm:inline">Remove Page</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Fields */}
                {currentPageFields.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <Plus className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {isMobile ? "Tap 'Add Fields' to add fields to this page" : `Click a field type from the left panel to add it to page ${currentPage}`}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {currentPageFields.map((field, index) => {
                    // On mobile, always use full width
                    const widthClass = isMobile ? 'w-full' : {
                      full: 'w-full',
                      half: 'w-1/2',
                      third: 'w-1/3',
                      quarter: 'w-1/4',
                    }[field.width || 'full'];
                    
                    const positionClass = isMobile ? '' : {
                      left: 'mr-auto',
                      center: 'mx-auto',
                      right: 'ml-auto',
                    }[field.position || 'left'];

                    return (
                      <div
                        key={field.id}
                        className={cn(widthClass, positionClass)}
                      >
                        <div
                          draggable={!isMobile}
                          onDragStart={() => !isMobile && handleDragStart(index)}
                          onDragOver={(e) => !isMobile && handleDragOver(e, index)}
                          onDragEnd={() => !isMobile && handleDragEnd()}
                          onClick={() => {
                            setSelectedFieldId(field.id);
                            if (isMobile) setShowSettingsPanel(true);
                          }}
                          className={cn(
                            "p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all group",
                            selectedField?.id === field.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                            draggedIndex === index && "opacity-50"
                          )}
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            {!isMobile && (
                              <button className="mt-1 p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                <GripVertical className="w-4 h-4" />
                              </button>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Label className="text-sm font-medium">
                                  {field.label}
                                  {field.required && <span className="text-destructive ml-1">*</span>}
                                </Label>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                  {field.width === 'half' ? '50%' : field.width === 'third' ? '33%' : field.width === 'quarter' ? '25%' : '100%'}
                                </span>
                              </div>
                              {renderFieldPreview(field)}
                            </div>
                            <div className={cn(
                              "flex items-center gap-1 transition-opacity",
                              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )}>
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
                                    setSelectedFieldId(null);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Field Settings (Desktop only) */}
          {!isMobile && (
            <Card className="w-72 shrink-0 overflow-auto">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Field Settings
                  </CardTitle>
                  {selectedField && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFieldId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {renderSettingsPanelContent()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FormBuilder;
