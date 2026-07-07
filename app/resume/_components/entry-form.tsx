// components/resume/entry-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { PlusCircle, X, Sparkles, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { entrySchema, type EntryFormValues } from "@/lib/zodSchema";
import { showToast } from "@/lib/showToast";

interface Entry {
  title: string;
  organization: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

interface EntryFormProps {
  type: "Experience" | "Education" | "Project";
  entries: Entry[];
  onChange: (entries: Entry[]) => void;
}

const formatDisplayDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

export default function EntryForm({ type, entries, onChange }: EntryFormProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = form.watch("current");
  const description = form.watch("description");

  const handleAdd = (data: EntryFormValues) => {
    const formattedEntry: Entry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate || ""),
    };

    onChange([...entries, formattedEntry]);
    form.reset();
    setIsAdding(false);
  };

  const handleDelete = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  // ✅ AI Improvement handler with fetch
  const handleImproveDescription = async () => {
    const currentDescription = form.getValues("description");
    if (!currentDescription) {
      showToast("error", "Please enter a description first");
      return;
    }

    setIsImproving(true);

    try {
      const response = await fetch("/api/resume/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current: currentDescription,
          type: type.toLowerCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to improve description");
      }

      // ✅ Set the improved description back to the form
      form.setValue("description", result.data);
      showToast("success", "Description improved successfully!");
    } catch (error: any) {
      showToast("error", error.message || "Failed to improve description");
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Entries */}
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title} @ {item.organization}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
                className="cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {item.current
                  ? `${item.startDate} - Present`
                  : `${item.startDate} - ${item.endDate}`}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <div className="space-y-4">
                {/* Title & Organization */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title/Position</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization/Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Google" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="month" {...field} disabled={current} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Current Checkbox */}
                <FormField
                  control={form.control}
                  name="current"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            if (checked) {
                              form.setValue("endDate", "");
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Current {type}</FormLabel>
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Description of your ${type.toLowerCase()}`}
                          className="h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ✅ AI Improve Button with loading state */}
                <Button
                  type="button"
                  className="cursor-pointer w-fit"
                  variant="ghost"
                  size="sm"
                  onClick={handleImproveDescription}
                  disabled={isImproving || !description}
                >
                  {isImproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Improving...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </>
                  )}
                </Button>

                {/* Footer Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setIsAdding(false);
                    }}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(handleAdd)}
                    className="cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </div>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!isAdding && (
        <Button className="w-full cursor-pointer" variant="outline" onClick={() => setIsAdding(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
}