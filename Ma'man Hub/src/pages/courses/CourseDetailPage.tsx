import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  Clock,
  Users,
  PlayCircle,
  FileText,
  Award,
  Download,
  Globe,
  Calendar,
  ChevronRight,
  Check,
  Heart,
  Share2,
  ShoppingCart,
  Lock,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { contentService, CourseDto } from "@/services/contentService";
import { cn } from "@/lib/utils";

// ── Types for detail-specific data not in CourseDto ──────────────────────────
interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lessonsCount: number;
  lessons: {
    id: string;
    title: string;
    duration: string;
    isFree: boolean;
  }[];
}

interface CourseReview {
  id: string;
  user: { name: string; avatar: string };
  rating: number;
  date: string;
  content: string;
}

interface CourseDetail extends CourseDto {
  subtitle?: string;
  whatYoullLearn?: string[];
  requirements?: string[];
  modules?: CourseModule[];
  reviews?: CourseReview[];
  relatedCourses?: {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
    rating: number;
    price: number;
  }[];
  originalPrice?: number;
  lecturesCount?: number;
  reviewsCount?: number;
  instructorBio?: string;
  instructorRating?: number;
  instructorReviewsCount?: number;
  instructorStudentsCount?: number;
  instructorCoursesCount?: number;
  lastUpdated?: string;
  category?: string;
}

const ratingDistribution = [
  { stars: 5, percentage: 72 },
  { stars: 4, percentage: 20 },
  { stars: 3, percentage: 5 },
  { stars: 2, percentage: 2 },
  { stars: 1, percentage: 1 },
];

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [couponCode, setCouponCode] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addItem, isInCart } = useCartStore();

  useEffect(() => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);

    contentService
      .getCourseById(courseId)
      .then((data) => {
        setCourse(data as CourseDetail);
        setIsFavorite(data.isInWishlist);
      })
      .catch(() => setError("Failed to load course. Please try again."))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  const handleAddToCart = () => {
    if (!course) return;
    addItem({
      id: course.id,
      title: course.title,
      instructor: course.instructorName,
      price: course.price,
      originalPrice: course.discountPrice ?? course.price,
      thumbnail: course.thumbnailUrl,
      level: course.levelDisplay ?? "",
    });
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error || !course) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-destructive text-lg">{error ?? "Course not found."}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const displayPrice = course.discountPrice ?? course.price;
  const hasDiscount = course.discountPrice != null && course.discountPrice < course.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / course.price) * 100)
    : 0;

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground py-12 lg:py-16">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                {course.categoryName && course.categoryName !== "Unknown" && (
                  <Badge variant="secondary">{course.categoryName}</Badge>
                )}
                {course.isFeatured && <Badge variant="secondary">Bestseller</Badge>}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold font-display">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-lg text-primary-foreground/80">{course.subtitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-warning">{course.rating.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(course.rating)
                            ? "fill-warning text-warning"
                            : "text-white/30",
                        )}
                      />
                    ))}
                  </div>
                  {course.reviewsCount && (
                    <span className="text-primary-foreground/60">
                      ({course.reviewsCount.toLocaleString()} ratings)
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.totalStudents.toLocaleString()} students
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {course.instructorAvatarUrl && (
                    <AvatarImage src={course.instructorAvatarUrl} />
                  )}
                  <AvatarFallback>{course.instructorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-primary-foreground/60">Created by</p>
                  <Link
                    to={`/profile/${course.instructorId}`}
                    className="hover:underline font-medium"
                  >
                    {course.instructorName}
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/80">
                {course.lastUpdated && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Updated {course.lastUpdated}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  {course.language}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.durationHours}h total
                </span>
              </div>
            </div>

            {/* Course Card (Desktop - Sticky) */}
            <div className="hidden lg:block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-24 bg-card text-card-foreground rounded-xl shadow-xl overflow-hidden"
              >
                <div className="aspect-video relative group cursor-pointer">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">${displayPrice.toFixed(2)}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          ${course.price.toFixed(2)}
                        </span>
                        <Badge className="bg-success text-success-foreground">
                          {discountPercent}% off
                        </Badge>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full h-12"
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={isInCart(course.id) || course.isInCart}
                    >
                      {isInCart(course.id) || course.isInCart ? (
                        "Added to Cart"
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-5 w-5" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full h-12" size="lg">
                      Buy Now
                    </Button>
                  </div>

                  <p className="text-center text-xs text-muted-foreground">
                    30-Day Money-Back Guarantee
                  </p>

                  <div className="space-y-2">
                    <h4 className="font-semibold">This course includes:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <PlayCircle className="h-4 w-4 text-muted-foreground" />
                        {course.durationHours}h on-demand video
                      </li>
                      {course.lecturesCount && (
                        <li className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {course.lecturesCount} articles
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        Downloadable resources
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        Certificate of completion
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart
                        className={cn(
                          "h-4 w-4 mr-1",
                          isFavorite && "fill-destructive text-destructive",
                        )}
                      />
                      Wishlist
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Apply Coupon</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="secondary">Apply</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Course Card */}
      <div className="lg:hidden sticky top-16 z-30 bg-card border-b border-border p-4">
        <div className="container flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">${displayPrice.toFixed(2)}</span>
            {hasDiscount && (
              <span className="ml-2 text-muted-foreground line-through">
                ${course.price.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={isInCart(course.id) || course.isInCart}
          >
            {isInCart(course.id) || course.isInCart ? "In Cart" : "Add to Cart"}
          </Button>
        </div>
      </div>

      {/* Course Content */}
      <div className="container py-12">
        <div className="lg:w-2/3 space-y-12">

          {/* What You'll Learn */}
          {course.whatYoullLearn && course.whatYoullLearn.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">What you'll learn</h2>
              <div className="grid sm:grid-cols-2 gap-3 p-6 border border-border rounded-xl">
                {course.whatYoullLearn.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Content / Modules */}
          {course.modules && course.modules.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display">Course content</h2>
                <p className="text-sm text-muted-foreground">
                  {course.modules.reduce((acc, m) => acc + m.lessonsCount, 0)} lectures •{" "}
                  {course.durationHours}h total length
                </p>
              </div>
              <Accordion type="multiple" className="border rounded-xl">
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={module.id}>
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span className="font-semibold text-left">{module.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {module.lessonsCount} lectures • {module.duration}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0">
                      <ul className="divide-y divide-border">
                        {module.lessons.map((lesson) => (
                          <li
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/50"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isFree ? (
                                <PlayCircle className="h-4 w-4 text-accent" />
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{lesson.title}</span>
                              {lesson.isFree && (
                                <Badge variant="secondary" className="text-xs">
                                  Preview
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {lesson.duration}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Requirements */}
          {course.requirements && course.requirements.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex gap-3">
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Description */}
          {course.description && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Description</h2>
              <div className="prose prose-sm max-w-none">
                {course.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          )}

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-bold font-display mb-6">Instructor</h2>
            <div className="flex gap-6">
              <Avatar className="h-24 w-24">
                {course.instructorAvatarUrl && (
                  <AvatarImage src={course.instructorAvatarUrl} />
                )}
                <AvatarFallback className="text-2xl">
                  {course.instructorName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/profile/${course.instructorId}`}
                  className="text-xl font-semibold text-accent hover:underline"
                >
                  {course.instructorName}
                </Link>
                {course.instructorBio && (
                  <p className="text-muted-foreground mt-1">{course.instructorBio}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                  {course.instructorRating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning" />
                      {course.instructorRating} Instructor Rating
                    </span>
                  )}
                  {course.instructorReviewsCount && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {course.instructorReviewsCount.toLocaleString()} Reviews
                    </span>
                  )}
                  {course.instructorStudentsCount && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {(course.instructorStudentsCount / 1_000_000).toFixed(1)}M Students
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Reviews */}
          {course.reviews && course.reviews.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Student Reviews</h2>

              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-warning">
                    {course.rating.toFixed(1)}
                  </p>
                  <div className="flex justify-center my-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(course.rating)
                            ? "fill-warning text-warning"
                            : "text-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Course Rating</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <Progress value={item.percentage} className="h-2" />
                      <div className="flex items-center gap-1 w-24">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < item.stars ? "fill-warning text-warning" : "text-muted",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground w-10">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {course.reviews.map((review) => (
                  <div key={review.id} className="border-b border-border pb-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        {review.user.avatar && <AvatarImage src={review.user.avatar} />}
                        <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{review.user.name}</p>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <div className="flex items-center gap-1 my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "fill-warning text-warning"
                                  : "text-muted",
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-sm mt-2">{review.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="mt-6">
                Show all reviews
              </Button>
            </section>
          )}

          {/* Related Courses */}
          {course.relatedCourses && course.relatedCourses.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold font-display mb-6">Students also bought</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {course.relatedCourses.map((related) => (
                  <Link
                    key={related.id}
                    to={`/courses/${related.id}`}
                    className="flex gap-4 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <img
                      src={related.thumbnail}
                      alt={related.title}
                      className="w-24 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm line-clamp-2">{related.title}</h3>
                      <p className="text-xs text-muted-foreground">{related.instructor}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-sm font-medium">{related.rating}</span>
                      </div>
                    </div>
                    <p className="font-bold">${related.price}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </MainLayout>
  );
}