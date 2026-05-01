import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/MainLayout";
import api from "@/services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryDto {
  id: string;
  name: string;
  displayOrder: number;
  description?: string;
  coursesCount?: number;
  imageUrl?: string;
}

interface PagedResult {
  items: CategoryDto[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse<T> { data: T; success: boolean; }

const PAGE_SIZE = 6;

// ── Images ────────────────────────────────────────────────────────────────────

const KEYWORD_IMAGES: [string, string][] = [
  ["early childhood",  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"],
  ["primary",          "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&q=80"],
  ["child dev",        "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80"],
  ["stem",             "https://images.unsplash.com/photo-1532094349884-543559a8f8e3?w=800&q=80"],
  ["arts",             "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800&q=80"],
  ["language",         "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"],
  ["special",          "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80"],
  ["social",           "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80"],
  ["physical",         "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&q=80"],
  ["parenting",        "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80"],
  ["family",           "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=80"],
];

const GENERIC_POOL = [
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&q=80",
  "https://images.unsplash.com/photo-1580894742597-87bc8789db3d?w=800&q=80",
  "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80",
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
  "https://images.unsplash.com/photo-1628863353691-0071c8c1874c?w=800&q=80",
];

function resolveImage(cat: CategoryDto, index: number): string {
  if (cat.imageUrl) return cat.imageUrl;
  const lower = cat.name.toLowerCase();
  const match = KEYWORD_IMAGES.find(([key]) => lower.includes(key));
  return match ? match[1] : GENERIC_POOL[index % GENERIC_POOL.length];
}

// ── Card ──────────────────────────────────────────────────────────────────────

function CategoryCard({ category, index }: { category: CategoryDto; index: number }) {
  const navigate = useNavigate();
  const [imgSrc, setImgSrc] = useState(() => resolveImage(category, index));

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.35, delay: (index % PAGE_SIZE) * 0.05, ease: "easeOut" }}
      whileHover="hover"
      onClick={() => navigate(`/courses?categoryId=${category.id}`)}
      className="group relative w-full text-left rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
    >
      <motion.img
        src={imgSrc}
        alt={category.name}
        onError={() => setImgSrc(GENERIC_POOL[index % GENERIC_POOL.length])}
        variants={{ hover: { scale: 1.07 } }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 z-10 flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />

        <div className="relative flex items-start justify-between p-3">
          {category.coursesCount != null && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/20">
              {category.coursesCount} course{category.coursesCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="flex-1" />

        <div className="relative p-5 flex flex-col gap-2">
          <h2 className="text-[17px] font-extrabold text-white leading-snug line-clamp-1 drop-shadow">
            {category.name}
          </h2>

          {category.description && (
            <motion.p
              variants={{ hover: { opacity: 1, y: 0 } }}
              initial={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.22 }}
              className="text-sm text-white/80 leading-relaxed line-clamp-2"
            >
              {category.description}
            </motion.p>
          )}

          <div className="flex items-center justify-between pt-2 mt-0.5 border-t border-white/20">
            <span className="text-sm font-semibold text-white/90">Browse courses</span>
            <motion.div
              variants={{ hover: { x: 0, opacity: 1 } }}
              initial={{ x: -6, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 shrink-0"
            >
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function CategoryCardSkeleton() {
  return <div className="rounded-2xl bg-muted aspect-[4/3] animate-pulse" />;
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i).filter(n => n <= totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1} className="gap-1">
        <ChevronLeft className="h-4 w-4" /> Prev
      </Button>
      {pages.map(n => (
        <Button key={n} variant={n === page ? "default" : "outline"} size="sm" className="w-9" onClick={() => onChange(n)}>
          {n}
        </Button>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page === totalPages} className="gap-1">
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page,        setPage]        = useState(1);
  const [items,       setItems]       = useState<CategoryDto[]>([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [totalPages,  setTotalPages]  = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);

  // committedSearch is what was actually submitted (Enter / clear).
  // searchQuery is the live input value — never sent to the backend directly.
  const [committedSearch, setCommittedSearch] = useState("");

  const fetchCategories = useCallback(async (search: string, pg: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pg), pageSize: String(PAGE_SIZE) });
      if (search.trim()) params.set("search", search.trim());

      const res = await api.get<ApiResponse<PagedResult>>(`/Category?${params.toString()}`);
      const payload = res.data.data;

      setItems(payload.items);
      setTotalCount(payload.totalCount);
      setTotalPages(payload.totalPages);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and whenever committedSearch or page changes
  useEffect(() => {
    fetchCategories(committedSearch, page);
  }, [committedSearch, page, fetchCategories]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setPage(1);
      setCommittedSearch(searchQuery.trim());
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setCommittedSearch("");
    setPage(1);
  };

  return (
    <MainLayout>
      <div className="container py-14 max-w-screen-xl">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold mb-5">
            <BookOpen className="h-3.5 w-3.5" />
            {loading ? "Loading…" : `${totalCount} categor${totalCount === 1 ? "y" : "ies"}`}
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Every subject,<br className="hidden sm:block" /> every learner
          </h1>
          <p className="text-muted-foreground text-xl max-w-xl mx-auto leading-relaxed">
            From newborns to teenagers — for parents, educators, and the curious. Find the perfect course for every stage of growth.
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="max-w-lg mx-auto mb-10">
          <div className="relative">
            {/* Static search icon on the left — decorative */}
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />

            <Input
              placeholder="Search categories…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 pr-20 h-11 text-sm rounded-xl"
            />

            {/* Right side: clear (×) when there's text, then search button always */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.15 }}
                    onClick={clearSearch}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                onClick={() => { setPage(1); setCommittedSearch(searchQuery.trim()); }}
                className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
                aria-label="Search"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {committedSearch && !loading && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-sm text-muted-foreground mt-2 text-center"
              >
                {totalCount > 0
                  ? `${totalCount} result${totalCount !== 1 ? "s" : ""} for "${committedSearch}"`
                  : `No categories match "${committedSearch}"`}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchCategories(committedSearch, page)}>Try Again</Button>
          </div>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(PAGE_SIZE)].map((_, i) => <CategoryCardSkeleton key={i} />)}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No categories found</h3>
              <p className="text-muted-foreground text-sm mb-4">Try a different search term</p>
              <Button variant="outline" onClick={clearSearch}>Clear search</Button>
            </motion.div>
          ) : (
            <motion.div
              key={`page-${page}-${committedSearch}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {items.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {!loading && !error && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}

      </div>
    </MainLayout>
  );
}