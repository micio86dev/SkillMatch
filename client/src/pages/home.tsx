import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { PostCard } from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, TrendingUp, Users, MessageSquare, Briefcase } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/layout";
import { VideoCallButton } from "@/components/video-call-button";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState("");

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/posts", { content, isPublic: true });
    },
    onSuccess: () => {
      setNewPostContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Your post has been shared!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;
    createPostMutation.mutate(newPostContent.trim());
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Welcome back, {user?.firstName || "Professional"}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Stay connected with the IT community and discover new opportunities.
              </p>
            </div>
            <div className="flex space-x-3">
              <VideoCallButton 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-md font-medium" 
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">50K+</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Professionals</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">1.2K</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Open Projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">24</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Unread Messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">+15%</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Profile Views</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Post */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Share with the community
              </h3>
              <Textarea
                placeholder="What's on your mind? Share your latest project, ask for advice, or discuss tech trends..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || createPostMutation.isPending}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {createPostMutation.isPending ? "Posting..." : "Share Post"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Community Feed
          </h2>
          
          {postsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                          <div className="w-24 h-3 bg-slate-300 dark:bg-slate-700 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                        <div className="w-3/4 h-4 bg-slate-300 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts && Array.isArray(posts) && posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No posts yet
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Be the first to share something with the community!
                </p>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  Create Your First Post
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
