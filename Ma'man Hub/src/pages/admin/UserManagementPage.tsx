import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search, MoreHorizontal, Eye, Ban, Trash2,
  CheckCircle, UserCheck, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { adminService, AdminUserDto } from "@/services/adminService";

// Read current admin from localStorage — same pattern used elsewhere in the app
function getCurrentAdmin() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

export default function UserManagementPage() {
  const { toast }    = useToast();
  const navigate     = useNavigate();
  const currentAdmin = getCurrentAdmin();
  const isSuperAdmin = !!currentAdmin?.isSuperAdmin;

  // ── Data ──
  const [users, setUsers]           = useState<AdminUserDto[]>([]);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading]   = useState(false);

  // ── Filters ──
  const [searchQuery, setSearchQuery]   = useState("");
  const [roleFilter, setRoleFilter]     = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const itemsPerPage = 5;

  // ── Selection ──
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // ── Loading states ──
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading]     = useState(false);

  // ── Delete dialog ──
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId?: string; isBulk?: boolean }>({ open: false });

  // ── Fetch ──
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getUsers({
        search:        searchQuery || undefined,
        role:          roleFilter   !== "all" ? roleFilter   : undefined,
        status:        statusFilter !== "all" ? statusFilter : undefined,
        page:          currentPage,
        limit:         itemsPerPage,
        isSuperAdmin,  // server uses this to include/exclude Admin-role users
      });

      // Server already excludes Admin-role rows for non-super-admin callers,
      // so data.total and data.totalPages are always accurate.
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelectedUsers([]);
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed to load users", variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [searchQuery, roleFilter, statusFilter, currentPage, isSuperAdmin]);

  useEffect(() => {
    const timer = setTimeout(fetchUsers, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, roleFilter, statusFilter]);

  // ── Selection ──
  const handleSelectAll = (checked: boolean) =>
    setSelectedUsers(checked ? users.map(u => u.id) : []);

  const handleSelectUser = (userId: string, checked: boolean) =>
    setSelectedUsers(prev => checked ? [...prev, userId] : prev.filter(id => id !== userId));

  // ── Single actions ──
  const handleApprove = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const updated = await adminService.approveUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updated.status } : u));
      toast({ title: "User approved" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally { setActionLoadingId(null); }
  };

  const handleSuspend = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      const updated = await adminService.suspendUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updated.status } : u));
      toast({ title: "User suspended" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally { setActionLoadingId(null); }
  };

  const confirmDelete = async () => {
    const { userId, isBulk } = deleteDialog;
    setDeleteDialog({ open: false });

    if (isBulk) {
      try {
        setIsBulkLoading(true);
        const res = await adminService.bulkDelete(selectedUsers);
        toast({ title: "Users deleted", description: `${res.affected} deleted.`, variant: "destructive" });
        setSelectedUsers([]);
        fetchUsers();
      } catch (e: any) {
        toast({ title: "Error", description: e.response?.data?.message || "Bulk delete failed", variant: "destructive" });
      } finally { setIsBulkLoading(false); }
    } else if (userId) {
      try {
        setActionLoadingId(userId);
        await adminService.deleteUser(userId);
        toast({ title: "User deleted", variant: "destructive" });
        // If this was the last item on a non-first page, go back one page
        // (the currentPage change triggers fetchUsers via useEffect).
        // Otherwise re-fetch the current page directly.
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(p => p - 1);
        } else {
          await fetchUsers();
        }
      } catch (e: any) {
        toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
      } finally { setActionLoadingId(null); }
    }
  };

  const handleBulkAction = async (action: "approve" | "suspend" | "delete") => {
    if (action === "delete") { setDeleteDialog({ open: true, isBulk: true }); return; }
    try {
      setIsBulkLoading(true);
      const fn = action === "approve" ? adminService.bulkApprove : adminService.bulkSuspend;
      const res = await fn(selectedUsers);
      toast({ title: `Bulk ${action}`, description: `${res.affected} users affected.` });
      setSelectedUsers([]);
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally { setIsBulkLoading(false); }
  };

  // ── Badge helpers ──
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":    return <Badge className="bg-success/10 text-success hover:bg-success/20">Active</Badge>;
      case "suspended": return <Badge variant="destructive">Suspended</Badge>;
      case "pending":   return <Badge variant="secondary">Pending</Badge>;
      default:          return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Student:    "bg-accent/10 text-accent",
      Creator:    "bg-violet-500/10 text-violet-500",
      Parent:     "bg-amber-500/10 text-amber-500",
      Specialist: "bg-emerald-500/10 text-emerald-500",
      Admin:      "bg-foreground/10 text-foreground",
    };
    return <Badge className={`${colors[role] || ""} hover:opacity-80`}>{role}</Badge>;
  };

  return (
    <>
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display">User Management</h1>
          <p className="text-muted-foreground">Manage and monitor platform users</p>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Student">Student</SelectItem>
              <SelectItem value="Parent">Parent</SelectItem>
              <SelectItem value="Creator">Creator</SelectItem>
              <SelectItem value="Specialist">Specialist</SelectItem>
              {isSuperAdmin && <SelectItem value="Admin">Admin</SelectItem>}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ── Bulk Actions ── */}
        {selectedUsers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">{selectedUsers.length} selected</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("approve")} disabled={isBulkLoading}>
              {isBulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserCheck className="h-4 w-4 mr-2" />}Approve
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction("suspend")} disabled={isBulkLoading}>
              {isBulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Ban className="h-4 w-4 mr-2" />}Suspend
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleBulkAction("delete")} disabled={isBulkLoading}>
              {isBulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}Delete
            </Button>
          </motion.div>
        )}

        {/* ── Table ── */}
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={selectedUsers.length === users.length && users.length > 0} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">No users found.</TableCell>
                </TableRow>
              ) : users.map(user => (
                <TableRow key={user.id} className={actionLoadingId === user.id ? "opacity-50 pointer-events-none" : ""}>
                  <TableCell>
                    <Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={checked => handleSelectUser(user.id, checked === true)} />
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          {actionLoadingId === user.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <MoreHorizontal className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" modal={false}>
                        <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                          <Eye className="h-4 w-4 mr-2" />View Details
                        </DropdownMenuItem>
                        {user.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />Approve
                          </DropdownMenuItem>
                        )}
                        {user.status === "active" && (
                          <DropdownMenuItem onClick={() => handleSuspend(user.id)}>
                            <Ban className="h-4 w-4 mr-2" />Suspend
                          </DropdownMenuItem>
                        )}
                        {user.status === "suspended" && (
                          <DropdownMenuItem onClick={() => handleApprove(user.id)}>
                            <UserCheck className="h-4 w-4 mr-2" />Reactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {total === 0 ? "No users" : `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, total)} of ${total} users`}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {currentPage} of {totalPages || 1}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>

    {/* ── Delete confirmation — outside layout to avoid backdrop trap ── */}
    <AlertDialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog({ open })}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {deleteDialog.isBulk
              ? `This will permanently delete ${selectedUsers.length} selected users and all their data.`
              : "This will permanently delete this user account and all associated data."}
            {" "}This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}