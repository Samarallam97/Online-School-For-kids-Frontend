import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Award, GraduationCap, FileText, Plus, X, Loader2, Download, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { SpecialistCertification } from "@/services/specialistService";

export function CertificationsTab() {
  const { toast } = useToast();
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const [certifications, setCertifications] = useState<SpecialistCertification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCert, setShowAddCert] = useState(false);
  const [isAddingCert, setIsAddingCert] = useState(false);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);
  const [isDeletingCert, setIsDeletingCert] = useState(false);
  const [certForm, setCertForm] = useState({ name: "", issuer: "", year: "", file: null as File | null });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await userService.getCertifications();
        setCertifications(data);
      } catch {
        toast({ title: "Error", description: "Failed to load certifications", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleAddCert = async () => {
    if (!certForm.name || !certForm.issuer || !certForm.year)
      return toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
    try {
      setIsAddingCert(true);
      const added = await userService.addCertification({ ...certForm, file: certForm.file || undefined });
      setCertifications(prev => [...prev, added]);
      setShowAddCert(false);
      setCertForm({ name: "", issuer: "", year: "", file: null });
      toast({ title: "Added" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setIsAddingCert(false);
    }
  };

  const handleDeleteCert = async () => {
    if (!certToDelete) return;
    try {
      setIsDeletingCert(true);
      await userService.deleteCertification(certToDelete);
      setCertifications(prev => prev.filter(c => c.id !== certToDelete));
      setCertToDelete(null);
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally {
      setIsDeletingCert(false);
    }
  };

  const handleDownloadCert = async (cert: SpecialistCertification) => {
    try {
      const blob = await userService.downloadCertification(cert.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cert.fileName || `${cert.name}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Error", description: "Failed to download", variant: "destructive" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" />Certifications & Credentials</CardTitle>
              <CardDescription>Your professional certifications</CardDescription>
            </div>
            <Dialog open={showAddCert} onOpenChange={setShowAddCert}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Add Certification</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Certification</DialogTitle>
                  <DialogDescription>Add a new certification or credential</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Certification Name <span className="text-red-500">*</span></Label>
                    <Input value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} placeholder="e.g., Certified Educational Psychologist" />
                  </div>
                  <div className="space-y-2">
                    <Label>Issuing Organization <span className="text-red-500">*</span></Label>
                    <Input value={certForm.issuer} onChange={e => setCertForm({ ...certForm, issuer: e.target.value })} placeholder="e.g., APA" />
                  </div>
                  <div className="space-y-2">
                    <Label>Year <span className="text-red-500">*</span></Label>
                    <Input value={certForm.year} onChange={e => setCertForm({ ...certForm, year: e.target.value })} placeholder="2024" />
                  </div>
                  <div className="space-y-2">
                    <Label>Certificate File (Optional)</Label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={certFileInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) setCertForm({ ...certForm, file: f }); }}
                      />
                      <Button type="button" variant="outline" onClick={() => certFileInputRef.current?.click()} className="flex-1">
                        <Upload className="mr-2 h-4 w-4" />{certForm.file ? certForm.file.name : "Choose file"}
                      </Button>
                      {certForm.file && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => setCertForm({ ...certForm, file: null })}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setShowAddCert(false); setCertForm({ name: "", issuer: "", year: "", file: null }); }} disabled={isAddingCert}>Cancel</Button>
                  <Button onClick={handleAddCert} disabled={isAddingCert}>
                    {isAddingCert && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading
            ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            : certifications.length === 0
              ? <div className="text-center py-12 text-muted-foreground"><GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No certifications added yet</p></div>
              : certifications.map(cert => (
                <div key={cert.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-primary/10 p-2"><GraduationCap className="h-5 w-5 text-primary" /></div>
                    <div>
                      <h3 className="font-medium">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer} • {cert.year}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {cert.fileUrl && <>
                      <Button variant="outline" size="sm" onClick={() => window.open(cert.fileUrl, "_blank")}><FileText className="mr-1 h-4 w-4" />View</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCert(cert)}><Download className="mr-1 h-4 w-4" />Download</Button>
                    </>}
                    <Button variant="ghost" size="icon" onClick={() => setCertToDelete(cert.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
        </CardContent>
      </Card>

      <AlertDialog open={!!certToDelete} onOpenChange={o => { if (!o) setCertToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Certification</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCertToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCert} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeletingCert}>
              {isDeletingCert && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}