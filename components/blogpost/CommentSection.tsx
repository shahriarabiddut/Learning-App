"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/better-auth-client-and-actions/auth-client";
import { useAddCommentMutation } from "@/lib/redux-features/blogPost/blogPostApi";
import { CommentStatus, IComment } from "@/models/comment.model"; // Import CommentStatus enum
import {
  Clock,
  Loader2,
  LogIn,
  MessageSquare,
  Reply as ReplyIcon,
  Send,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CommentsSectionProps {
  postId: string;
  comments?: IComment[];
  allowComments?: boolean;
}

interface PendingComment {
  name: string;
  email?: string;
  body: string;
  createdAt: Date;
  parentId?: string;
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
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    body: "",
  });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [pendingComments, setPendingComments] = useState<PendingComment[]>([]);

  const isLoggedIn = !!session?.user;

  // Auto-fill form data when session is available
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  // Filter only approved comments
  const approvedComments = comments.filter(
    (comment) => comment.status === CommentStatus.APPROVED
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!formData.body.trim()) {
      toast.error("Please enter your comment");
      return;
    }

    try {
      const newPendingComment: PendingComment = {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        body: formData.body.trim(),
        createdAt: new Date(),
      };
      setPendingComments((prev) => [...prev, newPendingComment]);

      await addComment({
        postId,
        comment: {
          name: formData.name.trim(),
          email: formData.email.trim() || undefined,
          body: formData.body.trim(),
        },
      }).unwrap();

      toast.success("Comment submitted! It will appear after approval.");
      setFormData((prev) => ({ ...prev, body: "" }));
    } catch (error) {
      setPendingComments((prev) => prev.slice(0, -1));
      console.error("Failed to add comment:", error);
      toast.error("Failed to submit comment. Please try again.");
    }
  };

  const handleReply = async (commentId: string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to reply");
      return;
    }

    if (!replyBody.trim()) {
      toast.error("Please enter your reply");
      return;
    }

    try {
      // Add reply logic here - you'll need to implement this in your API
      toast.success("Reply submitted! It will appear after approval.");
      setReplyBody("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to submit reply. Please try again.");
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
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Comments
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {approvedComments.length}{" "}
            {approvedComments.length === 1 ? "comment" : "comments"}
          </p>
        </div>
      </div>

      {/* Login Required Message */}
      {!isLoggedIn && (
        <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="p-8 text-center">
            <LogIn className="w-12 h-12 mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Sign in to join the conversation
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Share your thoughts and engage with our community
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/sign-in">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comment Form - Only show if logged in */}
      {isLoggedIn && (
        <Card className="mb-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Leave a Comment
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Textarea
                  id="body"
                  name="body"
                  value={formData.body}
                  onChange={handleChange}
                  placeholder="Share your thoughts..."
                  required
                  disabled={isLoading}
                  rows={4}
                  className="resize-none border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Commenting as{" "}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {session?.user.name}
                  </span>
                </p>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
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
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending Comments */}
      {pendingComments.length > 0 && (
        <div className="space-y-4 mb-8">
          {pendingComments.map((comment, index) => (
            <Card
              key={`pending-${index}`}
              className="border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/20"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          {comment.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatCommentDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3">
                      {comment.body}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full w-fit">
                      <Clock className="w-3 h-3" />
                      Pending approval
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approved Comments List */}
      {approvedComments.length > 0 ? (
        <div className="space-y-6">
          {approvedComments.map((comment, index) => (
            <Card
              key={index}
              className="border-2 border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg">
                    {comment.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                          {comment.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatCommentDate(comment.createdAt)}
                        </p>
                      </div>
                      {isLoggedIn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setReplyingTo(
                              replyingTo === comment.id ? null : comment.id
                            )
                          }
                          className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        >
                          {replyingTo === comment.id ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <ReplyIcon className="w-4 h-4 mr-1" />
                              Reply
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {comment.body}
                    </p>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 pl-4 border-l-2 border-emerald-500">
                        <Textarea
                          value={replyBody}
                          onChange={(e) => setReplyBody(e.target.value)}
                          placeholder="Write your reply..."
                          rows={3}
                          className="mb-2 resize-none border-slate-300 dark:border-slate-700 focus:border-emerald-500 dark:focus:border-emerald-500"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReply(comment.id)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                          <Button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyBody("");
                            }}
                            size="sm"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Nested Replies - Note: This needs backend support for fetching nested comments */}
                    {/* You would need to fetch replies separately or include them in the parent comment */}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-slate-400 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No comments yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Be the first to share your thoughts on this article!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
