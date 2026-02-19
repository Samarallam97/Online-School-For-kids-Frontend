import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { specialistService, SpecialistAvailabilitySlot } from "@/services/specialistService";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AvailabilityTab() {
  const { toast } = useToast();

  const [availability, setAvailability] = useState<SpecialistAvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showEditSlot, setShowEditSlot] = useState(false);
  const [showDeleteSlot, setShowDeleteSlot] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SpecialistAvailabilitySlot | null>(null);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [isDeletingSlot, setIsDeletingSlot] = useState(false);
  const [slotForm, setSlotForm] = useState({ day: "Monday", startTime: "", endTime: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await specialistService.getAvailability();
        setAvailability(data);
      } catch {
        toast({ title: "Error", description: "Failed to load availability", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const availByDay = DAYS_OF_WEEK
    .map(day => ({ day, slots: availability.filter(s => s.day === day) }))
    .filter(d => d.slots.length > 0);

  const handleAddSlot = async () => {
    if (!slotForm.startTime || !slotForm.endTime)
      return toast({ title: "Error", description: "Fill all fields", variant: "destructive" });
    try {
      setIsSavingSlot(true);
      const added = await specialistService.addAvailabilitySlot(slotForm);
      setAvailability(prev => [...prev, added]);
      setShowAddSlot(false);
      setSlotForm({ day: "Monday", startTime: "", endTime: "" });
      toast({ title: "Added" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleUpdateSlot = async () => {
    if (!selectedSlot) return;
    try {
      setIsSavingSlot(true);
      const updated = await specialistService.updateAvailabilitySlot(selectedSlot.id, slotForm);
      setAvailability(prev => prev.map(s => s.id === selectedSlot.id ? updated : s));
      setShowEditSlot(false);
      setSelectedSlot(null);
      setSlotForm({ day: "Monday", startTime: "", endTime: "" });
      toast({ title: "Updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.response?.data?.message || "Failed", variant: "destructive" });
    } finally {
      setIsSavingSlot(false);
    }
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlot) return;
    try {
      setIsDeletingSlot(true);
      await specialistService.deleteAvailabilitySlot(selectedSlot.id);
      setAvailability(prev => prev.filter(s => s.id !== selectedSlot.id));
      setShowDeleteSlot(false);
      setSelectedSlot(null);
      toast({ title: "Deleted" });
    } catch {
      toast({ title: "Error", description: "Failed", variant: "destructive" });
    } finally {
      setIsDeletingSlot(false);
    }
  };

  const SlotFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Day</Label>
        <Select value={slotForm.day} onValueChange={v => setSlotForm({ ...slotForm, day: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{DAYS_OF_WEEK.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Input type="time" value={slotForm.startTime} onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>End Time</Label>
          <Input type="time" value={slotForm.endTime} onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Availability Schedule</CardTitle>
              <CardDescription>Manage your available time slots</CardDescription>
            </div>
            <Dialog open={showAddSlot} onOpenChange={setShowAddSlot}>
              <DialogTrigger asChild>
                <Button onClick={() => setSlotForm({ day: "Monday", startTime: "", endTime: "" })}>
                  <Plus className="mr-2 h-4 w-4" />Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Availability Slot</DialogTitle></DialogHeader>
                <SlotFormFields />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddSlot(false)} disabled={isSavingSlot}>Cancel</Button>
                  <Button onClick={handleAddSlot} disabled={isSavingSlot}>
                    {isSavingSlot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add Slot
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading
            ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            : availability.length === 0
              ? <div className="text-center py-12 text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No availability slots added yet</p></div>
              : <div className="space-y-4">
                {availByDay.map(({ day, slots }) => (
                  <div key={day} className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-3">{day}</h3>
                    <div className="space-y-2">
                      {slots.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                          <span className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />{slot.startTime} — {slot.endTime}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedSlot(slot); setSlotForm({ day: slot.day, startTime: slot.startTime, endTime: slot.endTime }); setShowEditSlot(true); }}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setSelectedSlot(slot); setShowDeleteSlot(true); }}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>}
        </CardContent>
      </Card>

      <Dialog open={showEditSlot} onOpenChange={setShowEditSlot}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Availability Slot</DialogTitle></DialogHeader>
          <SlotFormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditSlot(false); setSelectedSlot(null); }} disabled={isSavingSlot}>Cancel</Button>
            <Button onClick={handleUpdateSlot} disabled={isSavingSlot}>
              {isSavingSlot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteSlot} onOpenChange={setShowDeleteSlot}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slot</AlertDialogTitle>
            <AlertDialogDescription>Remove this availability slot?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedSlot(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSlot} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeletingSlot}>
              {isDeletingSlot && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}