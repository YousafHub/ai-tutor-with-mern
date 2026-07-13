"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Edit, Monitor, Save, AlertTriangle, Loader2 } from "lucide-react";
import MarkdownEditor from "@uiw/react-markdown-editor";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { resumeSchema, type ResumeFormValues } from "@/lib/zodSchema";
import { entriesToMarkdown, parseMarkdownToFormData } from "@/lib/utils";
import EntryForm from "./entry-form";
import { showToast } from "@/lib/showToast";

interface ResumeBuilderProps {
    initialContent?: string;
    user: {
        fullName?: string;
        email?: string;
    } | null;
}

export default function ResumeBuilder({ initialContent, user }: ResumeBuilderProps) {
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [resumeMode, setResumeMode] = useState(false);
    const [previewContent, setPreviewContent] = useState(initialContent || "");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const getDefaultValues = () => {
        if (initialContent) {
            return parseMarkdownToFormData(initialContent);
        }
        return {
            contactInfo: {
                email: user?.email || "",
                mobile: "",
                linkedin: "",
                twitter: "",
            },
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        };
    };

    const form = useForm<ResumeFormValues>({
        resolver: zodResolver(resumeSchema),
        defaultValues: getDefaultValues(),
    });

    const formValues = form.watch();

    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent || initialContent || "");
        }
    }, [formValues, activeTab, initialContent]);

    useEffect(() => {
        if (initialContent) {
            const parsedData = parseMarkdownToFormData(initialContent);
            form.reset(parsedData);
            setActiveTab("preview");
        }
    }, [initialContent, form]);

    const getContactMarkdown = (): string => {
        const { contactInfo } = formValues;
        const parts: string[] = [];
        if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo?.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo?.linkedin) parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo?.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

        return parts.length > 0
            ? `## <div align="center">${user?.fullName || ""}</div>\n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
            : "";
    };

    const getCombinedContent = (): string => {
        const { summary, skills, experience, education, projects } = formValues;

        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience || [], "Work Experience"),
            entriesToMarkdown(education || [], "Education"),
            entriesToMarkdown(projects || [], "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    };

    const handleSave = async () => {
        const content = getCombinedContent();

        if (!content) {
            showToast("error", "Please add some content to your resume");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save resume');
            }

            showToast("success", "Resume saved successfully!");
        } catch (error: any) {
            showToast("error", error.message || "Failed to save resume");
        } finally {
            setIsSaving(false);
        }
    };

    const generatePDF = async () => {

        const html2pdf = (await import('html2pdf.js')).default;

        setIsGenerating(true);
        try {
            const element = document.getElementById("resume-pdf");
            if (!element) return;

            const opt = {
                margin: [15, 15, 15, 15] as [number, number, number, number],
                filename: "resume.pdf",
                image: { type: "jpeg" as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
            };

            await html2pdf().set(opt).from(element).save();
        } catch (error) {
            showToast("error", "Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <h1 className="font-bold gradient gradient-title text-5xl md:text-6xl">Resume Builder</h1>

                <div className="flex items-center gap-2 ml-auto">
                    <Button variant="destructive" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button onClick={generatePDF} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")}>
                <TabsList>
                    <TabsTrigger value="edit" className="cursor-pointer">Form</TabsTrigger>
                    <TabsTrigger value="preview" className="cursor-pointer">Markdown</TabsTrigger>
                </TabsList>

                {/* Edit Tab */}
                <TabsContent value="edit">
                    <Form {...form}>
                        <form className="space-y-8">
                            {/* Contact Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                    <FormField
                                        control={form.control}
                                        name="contactInfo.email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="your@email.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="contactInfo.mobile"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mobile Number</FormLabel>
                                                <FormControl>
                                                    <Input type="tel" placeholder="+1 234 567 8900" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="contactInfo.linkedin"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>LinkedIn URL</FormLabel>
                                                <FormControl>
                                                    <Input type="url" placeholder="https://linkedin.com/in/your-profile" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="contactInfo.twitter"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Twitter/X Profile</FormLabel>
                                                <FormControl>
                                                    <Input type="url" placeholder="https://twitter.com/your-handle" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Professional Summary */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Professional Summary</h3>
                                <FormField
                                    control={form.control}
                                    name="summary"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    className="h-32"
                                                    placeholder="Write a compelling professional summary..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Skills</h3>
                                <FormField
                                    control={form.control}
                                    name="skills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    className="h-32"
                                                    placeholder="List your key skills..."
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Experience */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Work Experience</h3>
                                <FormField
                                    control={form.control}
                                    name="experience"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <EntryForm
                                                    type="Experience"
                                                    entries={field.value || []}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Education */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Education</h3>
                                <FormField
                                    control={form.control}
                                    name="education"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <EntryForm
                                                    type="Education"
                                                    entries={field.value || []}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Projects */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Projects</h3>
                                <FormField
                                    control={form.control}
                                    name="projects"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <EntryForm
                                                    type="Project"
                                                    entries={field.value || []}
                                                    onChange={field.onChange}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </TabsContent>

                {/* Preview Tab */}
                <TabsContent value="preview">
                    <div className="flex justify-between items-center mb-4">
                        <Button
                            variant="link"
                            type="button"
                            className="mb-2"
                            onClick={() => setResumeMode(!resumeMode)}
                        >
                            {resumeMode ? (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Edit Resume
                                </>
                            ) : (
                                <>
                                    <Monitor className="h-4 w-4" />
                                    Show Preview
                                </>
                            )}
                        </Button>
                    </div>

                    {resumeMode && previewContent === "" && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">
                                You will lose edited markdown if you update the form data.
                            </span>
                        </div>
                    )}

                    <div className="border rounded-lg overflow-hidden">
                        {resumeMode ? (
                            <div className="wmde-markdown-var" data-color-mode="light">
                                <MarkdownEditor.Markdown
                                    source={previewContent}
                                    style={{ padding: "1rem" }}
                                />
                            </div>
                        ) : (
                            <div className="wmde-markdown-var" data-color-mode="light">
                                <MarkdownEditor
                                    value={previewContent}
                                    onChange={setPreviewContent}
                                    height="800"
                                />
                            </div>
                        )}
                    </div>

                    {/* Hidden PDF element */}
                    <div className="hidden">
                        <div id="resume-pdf">
                            <MarkdownEditor.Markdown
                                source={previewContent}
                                style={{ background: "white", color: "black" }}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}