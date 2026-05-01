import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingCart, BookOpen, Star, Clock,
  Users, Globe2, Trash2, Search, ArrowRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCartStore } from "@/stores/cartStore";
import { AgeGroup, AGE_GROUPS } from "@/services/contentService";
import { useWishlistStore } from "@/stores/wishlistStore";
import api from "@/services/api";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WishlistCourseDto {
  id:                   string;
  title:                string;
  description:          string;
  instructorId:         string;
  instructorName:       string;
  instructorAvatarUrl?: string;
  categoryId:           string;
  categoryName:         string;
  ageGroup:             number;
  price:                number;
  discountPrice?:       number | null;
  rating:               number;
  totalStudents:        number;
  durationHours:        number;
  thumbnailUrl:         string;
  language:             string;
  lastUpdated?:         string;
  wishlistId:           string;
  addedAt:              string;
  isInCart:             boolean;
}

interface WishlistResponse {
  items:      WishlistCourseDto[];
  totalCount: number;
  totalPages: number;
  page:       number;
  pageSize:   number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const AGE_GROUP_FROM_INT: Record<number, AgeGroup> = {
  0: "ForParents", 1: "ForEducators", 2: "Toddlers", 3: "Preschool",
  4: "EarlyPrimary", 5: "LatePrimary", 6: "Tweens", 7: "Teenagers",
};

function AgeGroupBadge({ value }: { value: number }) {
  const key  = AGE_GROUP_FROM_INT[value];
  const meta = key ? AGE_GROUPS.find(g => g.value === key) : null;
  if (!meta) return null;
  return (
    <span className={cn(
      "inline-flex items-center rounded-md font-semibold whitespace-nowrap tracking-wide uppercase px-2 py-0.5 text-[10px]",
      meta.color, meta.textColor,
    )}>
      {meta.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 50;

export default function WishlistPage() {
  const { toast }                                        = useToast();
  const { addItem, isInCart }                            = useCartStore();
  const { decrement: wishlistDecrement,
          setCount:  setWishlistCount }                  = useWishlistStore();

  const [items,     setItems]     = useState<WishlistCourseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [removing,  setRemoving]  = useState<Set<string>>(new Set());
  const [clearing,  setClearing]  = useState(false);

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const res = await api.get<{ data: WishlistResponse; success: boolean }>(
        `/Course/favourite?page=1&pageSize=${PAGE_SIZE}`
      );
      setItems(res.data.data.items);
      setWishlistCount(res.data.data.totalCount);
    } catch {
      setError("Failed to load your wishlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [setWishlistCount]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (courseId: string) => {
    setItems(prev => prev.filter(i => i.id !== courseId));
    setRemoving(prev => new Set(prev).add(courseId));
    wishlistDecrement();
    try {
      await api.delete(`/Course/favourite/${courseId}`);
      toast({ title: "Removed from wishlist" });
    } catch {
      fetchWishlist();
      toast({ title: "Could not remove item", variant: "destructive" });
    } finally {
      setRemoving(prev => { const n = new Set(prev); n.delete(courseId); return n; });
    }
  };

  const handleClearAll = async () => {
    if (!items.length || clearing) return;
    setClearing(true);
    const snapshot = [...items];
    setItems([]);
    setWishlistCount(0);
    try {
      await api.delete("/Course/favourite/clear");
      toast({ title: "Wishlist cleared" });
    } catch {
      setItems(snapshot);
      setWishlistCount(snapshot.length);
      toast({ title: "Could not clear wishlist", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  const handleAddToCart = (item: WishlistCourseDto) => {
    const hasDiscount = item.discountPrice != null && item.discountPrice < item.price;
    addItem({
      id:            item.id,
      title:         item.title,
      instructor:    item.instructorName,
      price:         hasDiscount ? item.discountPrice! : item.price,
      originalPrice: item.price,
      thumbnail:     item.thumbnailUrl ?? "",
      level:         AGE_GROUP_FROM_INT[item.ageGroup] ?? "",
    });
    toast({ title: "Added to cart", description: item.title });
  };

  const totalSavings = items.reduce((sum, i) =>
    i.discountPrice != null && i.discountPrice < i.price
      ? sum + (i.price - i.discountPrice) : sum, 0);
  const totalValue = items.reduce((s, i) => s + (i.discountPrice ?? i.price), 0);
  const notInCart  = items.filter(i => !isInCart(i.id) && !i.isInCart).length;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!isLoading && !error && items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Save courses you're interested in by clicking the heart icon.
          </p>
          <Link to="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
        <p className="text-muted-foreground mb-8">
          {items.length} saved {items.length !== 1 ? "courses" : "course"}
        </p>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Items ─────────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">

            {isLoading && [...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-xl bg-card">
                <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchWishlist}>Try Again</Button>
              </div>
            )}

            {!isLoading && !error && (
              <>
                {items.length > 1 && (
                  <div className="flex justify-end pb-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      disabled={clearing}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Clear all
                    </Button>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const displayPrice = item.discountPrice ?? item.price;
                    const hasDiscount  = item.discountPrice != null && item.discountPrice < item.price;
                    const inCart       = isInCart(item.id);

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                        className="flex gap-4 p-4 border rounded-xl bg-card hover:shadow-sm transition-shadow"
                      >
                        {/* Thumbnail */}
                        <Link
                          to={`/courses/${item.id}`}
                          className="shrink-0 w-32 h-20 rounded-lg overflow-hidden bg-muted flex items-center justify-center"
                        >
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={e => {
                                const img = e.currentTarget as HTMLImageElement;
                                img.style.display = "none";
                                (img.nextSibling as HTMLElement | null)?.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div className={cn(
                            "flex flex-col items-center justify-center w-full h-full text-muted-foreground",
                            item.thumbnailUrl ? "hidden" : "",
                          )}>
                            <BookOpen className="h-8 w-8 opacity-40" />
                          </div>
                        </Link>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/courses/${item.id}`}
                            className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2 block"
                          >
                            {item.title}
                          </Link>

                          {item.instructorName && (
                            <Link
                              to={`/profile/${item.instructorId}`}
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 mt-1 w-fit group/inst"
                            >
                              <Avatar className="h-4 w-4 shrink-0">
                                {item.instructorAvatarUrl && (
                                  <AvatarImage src={item.instructorAvatarUrl} />
                                )}
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                  {item.instructorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground group-hover/inst:text-primary transition-colors truncate">
                                {item.instructorName}
                              </span>
                            </Link>
                          )}

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 text-amber-500 font-semibold">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {item.rating.toFixed(1)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{item.durationHours}h
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />{item.totalStudents.toLocaleString()}
                            </span>
                            {item.language && (
                              <span className="flex items-center gap-1">
                                <Globe2 className="h-3 w-3" />{item.language}
                              </span>
                            )}
                          </div>

                          <div className="mt-1.5">
                            <AgeGroupBadge value={item.ageGroup} />
                          </div>
                        </div>

                        {/* Price + actions */}
                        <div className="shrink-0 flex flex-col items-end justify-between">
                          <div className="text-right">
                            <p className="font-bold text-base">${displayPrice.toFixed(2)}</p>
                            {hasDiscount && (
                              <p className="text-xs text-muted-foreground line-through">
                                ${item.price.toFixed(2)}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-1.5 items-end">
                            <Button
                              size="sm"
                              variant={inCart ? "secondary" : "default"}
                              onClick={() => handleAddToCart(item)}
                              disabled={inCart || item.isInCart}
                              className="h-8 px-3 text-xs"
                            >
                              {inCart || item.isInCart
                                ? <><Check className="h-3.5 w-3.5 mr-1" />In Cart</>
                                : <><ShoppingCart className="h-3.5 w-3.5 mr-1" />Add</>}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemove(item.id)}
                              disabled={removing.has(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* ── Summary panel ─────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-6 space-y-4 sticky top-24 bg-card">
              <h2 className="text-xl font-bold">Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Saved ({items.length} {items.length !== 1 ? "courses" : "course"})
                  </span>
                  <span>{items.length}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Potential savings</span>
                    <span>-${totalSavings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Not yet in cart</span>
                  <span>{notInCart}</span>
                </div>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total value</span>
                <span>${totalValue.toFixed(2)}</span>
              </div>

              <Link to="/courses">
                <Button variant="outline" className="w-full gap-2">
                  <Search className="h-4 w-4" />
                  Browse more courses
                </Button>
              </Link>

              <Link to="/cart">
                <Button className="w-full h-12 text-base font-semibold">
                  Go to Cart
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <p className="text-xs text-center text-muted-foreground">
                30-day money-back guarantee
              </p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}