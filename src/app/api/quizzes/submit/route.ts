
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quiz from '@/lib/models/Quiz';
import User from '@/lib/models/User';
import logger from '@/lib/logger';
import { isToday } from 'date-fns';

const CORRECT_ANSWER_XP = 10;
const QUIZ_COMPLETION_XP = 5;

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId, quizId, answers } = body;

    if (!userId || !quizId || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: 'User ID, Quiz ID, and answers are required' }, { status: 400 });
    }

    const [user, quiz] = await Promise.all([
      User.findById(userId),
      Quiz.findById(quizId).lean() // Use lean for performance as we are not modifying the quiz
    ]);

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 });
    }
    
    const correctAnswers = quiz.questions.map(q => q.correctAnswer);
    let score = 0;
    quiz.questions.forEach((question, index) => {
        // Only count score for answers that have been provided.
        // During the quiz, `answers` will have `null` for unanswered questions.
        if (answers[index] !== null && answers[index] === question.correctAnswer) {
            score++;
        }
    });

    const isFinalSubmission = !answers.includes(null);
    let pointsAwarded = 0;

    // Check if the user has already answered the quiz today
    const alreadyAnsweredToday = user.lastQuizAnsweredDate && isToday(new Date(user.lastQuizAnsweredDate));
    
    if (isFinalSubmission && !alreadyAnsweredToday) {
        // This logic only runs if all questions are answered and it's the first time today.
        pointsAwarded = (score * CORRECT_ANSWER_XP) + QUIZ_COMPLETION_XP;
        
        // Update user's profile
        user.monthlyXP = (user.monthlyXP || 0) + pointsAwarded;
        user.lastQuizAnsweredDate = new Date(); // Set the date
        user.quizHistory.push({
            quizId: quiz._id,
            score: score,
            answeredDate: new Date()
        });

        await user.save();
        logger.info(`[API/quiz/submit] User ${userId} completed quiz ${quizId}. Score: ${score}, XP Awarded: ${pointsAwarded}`);
    } else if (alreadyAnsweredToday) {
        pointsAwarded = 0; // Explicitly set to 0 on re-attempt
        logger.info(`[API/quiz/submit] User ${userId} re-attempted quiz ${quizId}. No XP awarded.`);
    }


    return NextResponse.json({ 
        success: true, 
        message: alreadyAnsweredToday && isFinalSubmission ? "You have already earned points for today's quiz." : "Submission processed.",
        data: { 
            pointsAwarded,
            score,
            totalQuestions: quiz.questions.length,
            correctAnswers: correctAnswers
        }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    logger.error(`[API/quiz/submit] Error: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
