// app/ai-cover-letter/_components/cover-letter-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { showToast } from "@/lib/showToast";

interface CoverLetter {
  _id: string;
  userId: string;
  content: string;
  jobDescription: string;
  companyName: string;
  jobTitle: string;
  status: 'draft' | 'completed';
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface CoverLetterListProps {
  coverLetters: CoverLetter[];
}

export default function CoverLetterList({ coverLetters }: CoverLetterListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cover-letter/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete cover letter');
      }

      showToast('success', 'Cover letter deleted successfully!');
      
      // ✅ Refresh the page to update the list
      router.refresh();
      
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete cover letter');
    } finally {
      setIsOpen(false);
      setDeleteId(null);
    }
  };

  if (!coverLetters?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">No Cover Letters Yet</CardTitle>
          <CardDescription>
            Create your first cover letter to get started
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => (
        <Card key={letter._id} className="group relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl gradient gradient-title">
                  {letter.jobTitle} at {letter.companyName}
                </CardTitle>
                <CardDescription>
                  Created {format(new Date(letter.createdAt), "PPP")}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/ai-cover-letter/${letter._id}`)}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                  <AlertDialogTrigger 
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 cursor-pointer"
                    onClick={() => {
                      setDeleteId(letter._id);
                      setIsOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Cover Letter?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your cover letter for {letter.jobTitle} at{' '}
                        {letter.companyName}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(deleteId || letter._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground text-sm line-clamp-3">
              {letter.jobDescription}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}