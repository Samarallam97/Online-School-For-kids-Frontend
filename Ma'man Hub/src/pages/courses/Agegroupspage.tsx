// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { ArrowRight, Star, Clock, Users } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { MainLayout } from "@/components/layout/MainLayout";
// import {
//   contentService, CourseDto, AgeGroup,
//   AGE_GROUPS, AgeGroupMeta,
// } from "@/services/contentService";
// import { AgeGroupBadge } from "@/pages/courses/CoursesCatalogPage";
// import { cn } from "@/lib/utils";

// // ── Age Group Card with preview courses ──────────────────────────────────────
// function AgeGroupSection({ group }: { group: AgeGroupMeta }) {
//   const navigate = useNavigate();
//   const [courses, setCourses] = useState<CourseDto[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     contentService
//       .getCourses({ ageGroup: group.value, pageSize: 4, sortBy: "rating" })
//       .then((r) => setCourses(r.items))
//       .catch(() => setCourses([]))
//       .finally(() => setLoading(false));
//   }, [group.value]);

//   return (
//     <motion.section
//       initial={{ opacity: 0, y: 32 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true, margin: "-80px" }}
//       transition={{ duration: 0.5 }}
//       className="mb-14"
//     >
//       {/* Section header */}
//       <div className={cn("rounded-2xl p-6 mb-6 border", group.color, group.borderColor)}>
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-4">
//             <span className="text-5xl leading-none">{group.emoji}</span>
//             <div>
//               <h2 className={cn("text-2xl font-bold", group.textColor)}>
//                 {group.label}
//               </h2>
//               <p className={cn("text-sm font-medium opacity-80", group.textColor)}>
//                 Ages {group.ageRange}
//               </p>
//             </div>
//           </div>
//           <Button
//             variant="outline"
//             className={cn("border", group.borderColor, group.textColor, "hover:opacity-80 bg-white/60")}
//             onClick={() =>
//               navigate(`/courses?ageGroup=${group.value}`)
//             }
//           >
//             Browse all
//             <ArrowRight className="h-4 w-4 ml-2" />
//           </Button>
//         </div>
//       </div>

//       {/* Course previews */}
//       {loading ? (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {[...Array(4)].map((_, i) => (
//             <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[4/5]" />
//           ))}
//         </div>
//       ) : courses.length === 0 ? (
//         <p className="text-muted-foreground text-sm pl-2">
//           No courses available for this group yet.
//         </p>
//       ) : (
//         <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
//           {courses.map((course, i) => (
//             <motion.div
//               key={course.id}
//               initial={{ opacity: 0, scale: 0.97 }}
//               whileInView={{ opacity: 1, scale: 1 }}
//               viewport={{ once: true }}
//               transition={{ delay: i * 0.06 }}
//             >
//               <Link
//                 to={`/courses/${course.id}`}
//                 className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full"
//               >
//                 {/* Thumbnail */}
//                 <div className="relative aspect-video overflow-hidden">
//                   <img
//                     src={course.thumbnailUrl}
//                     alt={course.title}
//                     className="w-full h-full object-cover transition-transform group-hover:scale-105"
//                   />
//                 </div>

//                 {/* Info */}
//                 <div className="p-3 flex flex-col flex-1">
//                   <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors flex-1">
//                     {course.title}
//                   </h3>

//                   {/* Instructor */}
//                   <Link
//                     to={`/profile/${course.instructorId}`}
//                     onClick={(e) => e.stopPropagation()}
//                     className="flex items-center gap-1.5 mt-2 group/inst w-fit"
//                   >
//                     <Avatar className="h-4 w-4">
//                       <AvatarImage src={course.instructorAvatarUrl} />
//                       <AvatarFallback className="text-[8px]">
//                         {course.instructorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
//                       </AvatarFallback>
//                     </Avatar>
//                     <span className="text-xs text-muted-foreground group-hover/inst:text-accent transition-colors truncate">
//                       {course.instructorName}
//                     </span>
//                   </Link>

//                   <div className="flex items-center justify-between mt-2">
//                     <div className="flex items-center gap-1">
//                       <Star className="h-3 w-3 fill-warning text-warning" />
//                       <span className="text-xs font-medium">{course.rating.toFixed(1)}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-xs text-muted-foreground">
//                       <span className="flex items-center gap-0.5">
//                         <Clock className="h-3 w-3" />{course.durationHours}h
//                       </span>
//                     </div>
//                   </div>

//                   <div className="mt-2 flex items-center justify-between">
//                     <span className="font-bold text-sm">
//                       ${(course.discountPrice ?? course.price).toFixed(2)}
//                     </span>
//                     {course.discountPrice != null && course.discountPrice < course.price && (
//                       <span className="text-xs text-muted-foreground line-through">
//                         ${course.price.toFixed(2)}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </Link>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </motion.section>
//   );
// }

// // ── Page ──────────────────────────────────────────────────────────────────────
// export default function AgeGroupsPage() {
//   return (
//     <MainLayout>
//       <div className="container py-10">
//         {/* Hero */}
//         <div className="mb-12 text-center">
//           <h1 className="text-4xl font-bold font-display mb-3">
//             Find Courses by Age Group
//           </h1>
//           <p className="text-muted-foreground text-lg max-w-xl mx-auto">
//             Every learner is different. Browse courses hand-picked for each stage
//             of childhood — from toddlers to teens, and for the parents and educators who guide them.
//           </p>
//         </div>

//         {/* Quick jump chips */}
//         <div className="flex flex-wrap gap-2 justify-center mb-14">
//           {AGE_GROUPS.map((group) => (
//             <a key={group.value} href={`#${group.value}`}>
//               <span
//                 className={cn(
//                   "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer transition-opacity hover:opacity-70",
//                   group.color, group.textColor, group.borderColor,
//                 )}
//               >
//                 {group.emoji} {group.label}
//                 <span className="opacity-60 text-xs">· {group.ageRange}</span>
//               </span>
//             </a>
//           ))}
//         </div>

//         {/* One section per age group */}
//         {AGE_GROUPS.map((group) => (
//           <div key={group.value} id={group.value}>
//             <AgeGroupSection group={group} />
//           </div>
//         ))}
//       </div>
//     </MainLayout>
//   );
// }