"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IQuiz } from "@/lib/models/QuizQuestion";
import { useUserActions } from "@/context/UserActionsContext";
import { Skeleton } from "../ui/skeleton";
import { Loader2, PartyPopper, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import MainLoginForm from "../auth/MainLoginForm";
import { cn } from "@/lib/utils";
import { quizApi } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface QuizPopupProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onClose?: () => void; // optional callback when popup closes
}

export default function QuizPopup({
  isOpen,
  setIsOpen,
  onClose,
}: QuizPopupProps) {
  const [quizzes, setQuizzes] = React.useState<IQuiz[]>([]);
  const [activeQuiz, setActiveQuiz] = React.useState<IQuiz | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<(number | null)[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [quizResult, setQuizResult] = React.useState<{
    score: number;
    pointsAwarded: number;
    totalQuestions: number;
    correctAnswers: number[];
  } | null>(null);
  const [showFeedback, setShowFeedback] = React.useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = React.useState(false);
  const [feedbackCorrectAnswers, setFeedbackCorrectAnswers] = React.useState<
    number[] | null
  >(null);

  const { toast } = useToast();
  const { isLoggedIn, userId, quizHistory, hasPlayedQuizToday } =
    useUserActions();

  const resetState = React.useCallback(() => {
    setActiveQuiz(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setQuizResult(null);
    setShowFeedback(false);
    setFeedbackCorrectAnswers(null);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      const fetchQuizzes = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("/api/quizzes/today");
          if (response.ok) {
            const data = await response.json();
            setQuizzes(data.data);
            if (data.data.length > 0) {
              // Check if any quiz has been played today
              const playedQuizIds = new Set(quizHistory.map((h) => h.quizId));
              const unplayedQuiz = data.data.find(
                (q: IQuiz) => !playedQuizIds.has(q._id)
              );
              if (unplayedQuiz) {
                setActiveQuiz(unplayedQuiz);
                setAnswers(new Array(unplayedQuiz.questions.length).fill(null));
              } else {
                setActiveQuiz(data.data[0]); // Default to first if all played
              }
            }
          } else {
            setQuizzes([]);
          }
        } catch (error) {
          console.error("Failed to fetch today's quizzes:", error);
          setQuizzes([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuizzes();
    } else {
      resetState();
      setQuizzes([]);
    }
  }, [isOpen, resetState, quizHistory]);

  const handleSelectOption = (index: number) => {
    if (showFeedback) return;
    setSelectedOption(index);
  };

  const handleNextQuestion = async () => {
    if (selectedOption === null) {
      toast({ title: "Please select an answer", variant: "destructive" });
      return;
    }

    if (!isLoggedIn) {
      setIsLoginDialogOpen(true);
      return;
    }

    const currentAnswers = [...answers];
    currentAnswers[currentQuestionIndex] = selectedOption;
    setAnswers(currentAnswers);

    setIsSubmitting(true);
    try {
      const isFinalSubmission =
        currentQuestionIndex === (activeQuiz?.questions.length ?? 0) - 1;
      const finalAnswersForSubmission = [...currentAnswers];
      if (isFinalSubmission) {
        finalAnswersForSubmission[currentQuestionIndex] = selectedOption;
      }

      const data = await quizApi.submit({
        quizId: activeQuiz!._id,
        userId,
        answers: finalAnswersForSubmission,
      });

      if (data.correctAnswers) {
        setFeedbackCorrectAnswers(data.correctAnswers);
      }
      setShowFeedback(true);

      if (isFinalSubmission) {
        setQuizResult(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not verify answer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const proceedToNext = () => {
    if (quizResult) return;
    setShowFeedback(false);
    setSelectedOption(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleTabChange = (quizId: string) => {
    const newQuiz = quizzes.find((q) => q._id === quizId);
    if (newQuiz) {
      resetState();
      setActiveQuiz(newQuiz);
      setAnswers(new Array(newQuiz.questions.length).fill(null));
    }
  };

  const currentQuestion = activeQuiz?.questions[currentQuestionIndex];
  const isLastQuestion =
    currentQuestionIndex === (activeQuiz?.questions?.length || 0) - 1;
  const progressValue = activeQuiz
    ? ((currentQuestionIndex + 1) / activeQuiz.questions.length) * 100
    : 0;

  const getButtonVariant = (index: number) => {
    if (!showFeedback) {
      return selectedOption === index ? "default" : "outline";
    }
    const correctAns = feedbackCorrectAnswers?.[currentQuestionIndex];
    if (index === correctAns) return "success";
    if (selectedOption === index && index !== correctAns) return "destructive";
    return "outline";
  };

  const renderQuizContent = () => {
    if (!activeQuiz) {
      return (
        <p className="text-center text-muted-foreground py-8">
          No quiz available for this category today.
        </p>
      );
    }

    if (quizResult) {
      if (quizResult.pointsAwarded > 0) {
        return (
          <div className="text-center space-y-4">
            <PartyPopper className="h-16 w-16 text-yellow-500 mx-auto animate-bounce" />
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-lg">
              You scored{" "}
              <span className="font-bold text-primary">{quizResult.score}</span>{" "}
              out of {quizResult.totalQuestions}.
            </p>
            <p className="text-lg">
              You've earned{" "}
              <span className="font-bold text-primary">
                {quizResult.pointsAwarded}
              </span>{" "}
              XP!
            </p>
            <Button
              onClick={() => {
                setIsOpen(false);
                if (onClose) onClose();
              }}
            >
              Close
            </Button>
          </div>
        );
      } else {
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-muted-foreground">
              You have already earned points for this quiz today.
            </p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        );
      }
    }

    return (
      <div className="flex flex-col h-full">
        <div className="space-y-2 mb-4">
          <Progress value={progressValue} className="w-full h-2" />
          <p className="text-sm text-muted-foreground text-center">
            Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
          </p>
        </div>
        <div className="py-4 flex-grow">
          <p className="font-semibold">{currentQuestion?.questionText}</p>

          {currentQuestion?.image && (
            <img
              src={currentQuestion.image}
              alt="Quiz context"
              className="rounded-md max-h-48 mx-auto mb-4"
            />
          )}

          {currentQuestion?.questionType === "mcqWithImage" ? (
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion?.options.map((option, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(index)}
                  className="w-full h-40 flex flex-col justify-center items-center"
                  onClick={() => handleSelectOption(index)}
                  disabled={showFeedback || isSubmitting}
                >
                  <img
                    src={option.imageUrl}
                    alt={`Option ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md mb-2"
                  />
                  <span className="text-center">{option.text}</span>
                  {showFeedback &&
                    (feedbackCorrectAnswers?.[currentQuestionIndex] ===
                    index ? (
                      <CheckCircle className="h-5 w-5 text-white mt-1" />
                    ) : selectedOption === index ? (
                      <XCircle className="h-5 w-5 text-white mt-1" />
                    ) : null)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {currentQuestion?.options.map((option, index) => (
                <Button
                  key={index}
                  variant={getButtonVariant(index)}
                  className="w-full justify-start h-auto py-2"
                  onClick={() => handleSelectOption(index)}
                  disabled={showFeedback || isSubmitting}
                >
                  <div className="flex items-center w-full">
                    <span className="flex-grow text-left whitespace-normal">
                      {option.text}
                    </span>
                    {showFeedback &&
                      (feedbackCorrectAnswers?.[currentQuestionIndex] ===
                      index ? (
                        <CheckCircle className="h-5 w-5 text-white ml-2" />
                      ) : selectedOption === index ? (
                        <XCircle className="h-5 w-5 text-white ml-2" />
                      ) : null)}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-auto">
          {showFeedback ? (
            <Button onClick={proceedToNext} disabled={isSubmitting}>
              {isLastQuestion ? "Show Results" : "Continue"}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={isSubmitting || selectedOption === null}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isLastQuestion ? (
                "Finish"
              ) : (
                "Next"
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderContentWithTabs = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    if (quizzes.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-8">
          No quizzes available for today. Check back tomorrow!
        </p>
      );
    }

    return (
      <Tabs
        defaultValue={activeQuiz?._id}
        onValueChange={handleTabChange}
        className="flex flex-col h-full"
      >
        <TabsList className="w-full">
          {quizzes.map((quiz) => (
            <TabsTrigger key={quiz._id} value={quiz._id} className="flex-1">
              {quiz.category}
            </TabsTrigger>
          ))}
        </TabsList>
        {quizzes.map((quiz) => (
          <TabsContent
            key={quiz._id}
            value={quiz._id}
            className="flex-grow mt-4"
          >
            {renderQuizContent()}
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] flex flex-col">
          {renderContentWithTabs()}
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join Review4it to Continue!</DialogTitle>
            <DialogDescription>
              Please log in to save your progress and earn points.
            </DialogDescription>
          </DialogHeader>
          <MainLoginForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
              onClick={() => {
                setIsLoginDialogOpen(false);
                setIsOpen(false);
              }}
            >
              Sign up
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
