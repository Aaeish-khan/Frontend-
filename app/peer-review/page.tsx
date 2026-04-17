"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { peerReviews, chatMessages, currentUser, interviewHistory } from "@/lib/mock-data"
import { 
  Users, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Send,
  Star,
  Video,
  ChevronRight,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { staggerContainer, staggerItem, cardVariants } from "@/lib/animations"

type Tab = "received" | "given" | "requests"

export default function PeerReviewPage() {
  const [activeTab, setActiveTab] = useState<Tab>("received")
  const [selectedReview, setSelectedReview] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showRequestModal, setShowRequestModal] = useState(false)

  const tabs = [
    { id: "received", label: "Received Reviews", count: peerReviews.filter(r => r.requestedBy.id === currentUser.id && r.status === "completed").length },
    { id: "given", label: "Reviews to Give", count: peerReviews.filter(r => r.reviewer.id === currentUser.id && r.status === "action_required").length },
    { id: "requests", label: "Pending Requests", count: peerReviews.filter(r => r.status === "pending").length },
  ]

  const getFilteredReviews = () => {
    switch (activeTab) {
      case "received":
        return peerReviews.filter(r => r.requestedBy.id === currentUser.id)
      case "given":
        return peerReviews.filter(r => r.reviewer.id === currentUser.id)
      case "requests":
        return peerReviews.filter(r => r.status === "pending")
      default:
        return []
    }
  }

  const selectedReviewData = peerReviews.find(r => r.id === selectedReview)
  const reviewMessages = chatMessages.filter(m => m.reviewId === selectedReview)

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
          <CheckCircle className="h-3 w-3" /> Completed
        </span>
      case "pending":
        return <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
          <Clock className="h-3 w-3" /> Pending
        </span>
      case "action_required":
        return <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <AlertCircle className="h-3 w-3" /> Action Required
        </span>
      default:
        return null
    }
  }

  return (
    <AppShell 
      title="Peer Review"
      description="Get feedback from peers and help others improve"
    >
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Stats */}
        <motion.div variants={staggerItem} className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{peerReviews.filter(r => r.status === "completed").length}</p>
                <p className="text-sm text-muted-foreground">Reviews Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <Star className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">4.5</p>
                <p className="text-sm text-muted-foreground">Average Rating Given</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Peer Connections</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "outline"}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="gap-2"
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                    activeTab === tab.id ? "bg-primary-foreground/20" : "bg-primary text-primary-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowRequestModal(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Request Review
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Review List */}
          <div className="lg:col-span-1 space-y-3">
            {getFilteredReviews().map((review) => (
              <Card 
                key={review.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  selectedReview === review.id && "border-primary"
                )}
                onClick={() => setSelectedReview(review.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewer.avatar} />
                      <AvatarFallback>{review.reviewer.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{review.reviewer.name}</p>
                        {getStatusBadge(review.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {review.interviewTitle}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(review.requestedAt)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {getFilteredReviews().length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <p>No reviews in this category</p>
              </div>
            )}
          </div>

          {/* Review Detail */}
          <div className="lg:col-span-2">
            {selectedReviewData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedReviewData.interviewTitle}</CardTitle>
                    {getStatusBadge(selectedReviewData.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Preview */}
                  <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                    <Button variant="outline" className="gap-2">
                      <Play className="h-5 w-5" />
                      Watch Recording
                    </Button>
                  </div>

                  {/* Timestamp Comments */}
                  {selectedReviewData.status === "completed" && selectedReviewData.comments && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Timestamp Comments</h4>
                      {selectedReviewData.comments.map((comment, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex gap-3 rounded-lg border p-3",
                            comment.type === "positive" && "border-green-500/20 bg-green-500/5",
                            comment.type === "suggestion" && "border-yellow-500/20 bg-yellow-500/5"
                          )}
                        >
                          <span className="shrink-0 rounded bg-muted px-2 py-1 text-xs font-mono">
                            {Math.floor(comment.timestamp / 60)}:{(comment.timestamp % 60).toString().padStart(2, "0")}
                          </span>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Overall Rating */}
                  {selectedReviewData.status === "completed" && selectedReviewData.overallRating && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Overall Rating</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-5 w-5",
                              star <= selectedReviewData.overallRating!
                                ? "fill-yellow-500 text-yellow-500"
                                : "text-muted"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-sm text-muted-foreground">
                          {selectedReviewData.overallRating}/5
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {selectedReviewData.summary && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedReviewData.summary}
                      </p>
                    </div>
                  )}

                  {/* Chat Section */}
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-medium">Discussion</h4>
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {reviewMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex gap-3",
                            message.sender.id === currentUser.id && "flex-row-reverse"
                          )}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.sender.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "rounded-lg px-3 py-2 max-w-[80%]",
                            message.sender.id === currentUser.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}>
                            <p className="text-sm">{message.message}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              message.sender.id === currentUser.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}>
                              {formatTimeAgo(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <Button size="icon">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                  <p>Select a review to see details</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Request Review Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Card className="w-full max-w-lg mx-4">
              <CardHeader>
                <CardTitle>Request Peer Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Interview</label>
                  <div className="space-y-2">
                    {interviewHistory.slice(0, 3).map((interview) => (
                      <button
                        key={interview.id}
                        className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-primary/50 transition-colors"
                      >
                        <Video className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">{interview.category}</p>
                          <p className="text-sm text-muted-foreground">{interview.role} - {interview.date}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message (Optional)</label>
                  <Textarea placeholder="Add a message for your reviewer..." rows={3} />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowRequestModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setShowRequestModal(false)}>
                    Send Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
