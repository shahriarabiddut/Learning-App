"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddCommentMutation } from "@/lib/redux-features/blogPost/blogPostApi";
import { IComment } from "@/models/blogPost.model";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CommentsSectionProps {
  postId: string;
  comments?: IComment[];
  allowComments?: boolean;
}

function formatCommentDate(date: Date | string | undefined): string {
  if (!date) return "Just now";
  try {
    const commentDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return commentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function CommentsSection({
  postId,
  comments = [],
  allowComments = true,
}: CommentsSectionProps) {
  const [addComment, { isLoading }] = useAddCommentMutation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    body: "",
  });

  // Filter only approved comments
  const approvedComments = comments.filter((comment) => comment.approved);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.body.trim()) {
      toast.error("Please fill in your name and comment");
      return;
    }

    try {
      await addComment({
        postId,
        comment: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          body: formData.body.trim(),
        },
      }).unwrap();

      toast.success(
        "Comment submitted successfully! It will appear after approval."
      );
      setFormData({ name: "", email: "", body: "" });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to submit comment. Please try again.");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (!allowComments) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Comments ({approvedComments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <Card className="mb-8 border-2">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Leave a Comment
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="body">
                Comment <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="body"
                name="body"
                value={formData.body}
                onChange={handleChange}
                placeholder="Share your thoughts..."
                required
                disabled={isLoading}
                rows={4}
                className="mt-1 resize-none"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {approvedComments.length > 0 ? (
        <div className="space-y-4">
          {approvedComments.map((comment, index) => (
            <Card key={index} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary">
                      {comment.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {comment.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatCommentDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {comment.body}
                    </p>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-3 border-l-2 border-muted pl-4">
                        {comment.replies
                          .filter((reply) => reply.approved)
                          .map((reply, replyIndex) => (
                            <div key={replyIndex} className="flex gap-3">
                              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-secondary/30 to-secondary/10 flex-shrink-0">
                                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-secondary-foreground">
                                  {reply.name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-semibold text-sm text-foreground">
                                    {reply.name}
                                  </h5>
                                  <span className="text-xs text-muted-foreground">
                                    {formatCommentDate(reply.createdAt)}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {reply.body}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-8 pb-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
