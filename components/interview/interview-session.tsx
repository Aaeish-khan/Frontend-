"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { interviewQuestions } from "@/lib/mock-data"
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  SkipForward, 
  StopCircle,
  Clock,
  ChevronRight,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface InterviewSessionProps {
  config: { category: string; role: string; company: string }
  onComplete: (results: InterviewResults) => void
}

export interface InterviewResults {
  category: string
  role: string
  company: string
  questions: QuestionResult[]
  totalTime: number
  overallScore: number
}

interface QuestionResult {
  question: string
  difficulty: string
  timeSpent: number
  timeLimit: number
  score: number
  feedback: string
}

export function InterviewSession({ config, onComplete }: InterviewSessionProps) {
  const questions = interviewQuestions[config.category as keyof typeof interviewQuestions] || interviewQuestions.tech
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 180)
  const [totalTime, setTotalTime] = useState(0)
  const [answers, setAnswers] = useState<QuestionResult[]>([])
  const [showWarning, setShowWarning] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Failed to access camera:", err)
      }
    }
    startCamera()

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 10 && prev > 0) setShowWarning(true)
        if (prev <= 0) return 0
        return prev - 1
      })
      setTotalTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto advance when time runs out
  useEffect(() => {
    if (timeLeft === 0 && isRecording) {
      handleNextQuestion()
    }
  }, [timeLeft, isRecording])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setShowWarning(false)
  }

  const handleNextQuestion = useCallback(() => {
    // Save answer result
    const timeSpent = currentQuestion.timeLimit - timeLeft
    const mockScore = Math.floor(Math.random() * 30) + 65 // Mock score 65-95
    
    const result: QuestionResult = {
      question: currentQuestion.question,
      difficulty: currentQuestion.difficulty,
      timeSpent,
      timeLimit: currentQuestion.timeLimit,
      score: mockScore,
      feedback: generateMockFeedback(mockScore),
    }

    const newAnswers = [...answers, result]
    setAnswers(newAnswers)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setTimeLeft(questions[currentIndex + 1].timeLimit)
      setIsRecording(false)
      setShowWarning(false)
    } else {
      // Interview complete
      const avgScore = Math.round(newAnswers.reduce((acc, a) => acc + a.score, 0) / newAnswers.length)
      onComplete({
        category: config.category,
        role: config.role,
        company: config.company,
        questions: newAnswers,
        totalTime,
        overallScore: avgScore,
      })
    }
  }, [currentIndex, timeLeft, answers, questions, config, totalTime, onComplete, currentQuestion])

  const handleEndInterview = () => {
    handleNextQuestion()
    // Force complete after current question
    if (currentIndex === questions.length - 1) return
    
    const remaining = questions.slice(currentIndex + 1).map(q => ({
      question: q.question,
      difficulty: q.difficulty,
      timeSpent: 0,
      timeLimit: q.timeLimit,
      score: 0,
      feedback: "Question skipped",
    }))

    const allAnswers = [...answers, ...remaining]
    const avgScore = Math.round(allAnswers.filter(a => a.score > 0).reduce((acc, a) => acc + a.score, 0) / allAnswers.filter(a => a.score > 0).length) || 0
    
    onComplete({
      category: config.category,
      role: config.role,
      company: config.company,
      questions: allAnswers,
      totalTime,
      overallScore: avgScore,
    })
  }

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = isVideoOff
        setIsVideoOff(!isVideoOff)
      }
    }
  }

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Video Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cn(
                "h-full w-full object-cover",
                isVideoOff && "hidden"
              )}
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <VideoOff className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                <span className="text-sm font-medium text-white">Recording</span>
              </div>
            )}

            {/* Timer */}
            <div className={cn(
              "absolute right-4 top-4 flex items-center gap-2 rounded-full px-3 py-1.5",
              timeLeft <= 10 ? "bg-red-500" : "bg-black/60"
            )}>
              <Clock className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">{formatTime(timeLeft)}</span>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleVideo}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={handleEndInterview}
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{currentIndex + 1} of {questions.length} questions</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Panel */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  currentQuestion.difficulty === "easy" && "bg-green-500/10 text-green-500",
                  currentQuestion.difficulty === "medium" && "bg-yellow-500/10 text-yellow-500",
                  currentQuestion.difficulty === "hard" && "bg-red-500/10 text-red-500"
                )}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-sm text-muted-foreground">
                  Q{currentIndex + 1}
                </span>
              </div>

              <p className="text-lg font-medium leading-relaxed">
                {currentQuestion.question}
              </p>

              {showWarning && (
                <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 p-3 text-yellow-500">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span className="text-sm">Time is running out!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          {!isRecording ? (
            <Button className="flex-1 gap-2" onClick={handleStartRecording}>
              <Mic className="h-4 w-4" />
              Start Answer
            </Button>
          ) : (
            <Button 
              className="flex-1 gap-2" 
              variant="outline"
              onClick={handleNextQuestion}
            >
              {currentIndex < questions.length - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Finish Interview
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Tips */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Tips</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>- Speak clearly and at a moderate pace</li>
              <li>- Structure your answer logically</li>
              <li>- Use specific examples when possible</li>
              <li>- Maintain eye contact with the camera</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function generateMockFeedback(score: number): string {
  if (score >= 85) {
    return "Excellent response! Clear structure, good examples, and confident delivery."
  } else if (score >= 75) {
    return "Good answer with solid points. Consider adding more specific examples."
  } else if (score >= 65) {
    return "Decent response. Work on structuring your answer more clearly and be more concise."
  } else {
    return "Needs improvement. Practice articulating your thoughts more clearly."
  }
}
